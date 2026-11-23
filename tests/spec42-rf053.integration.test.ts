// Use the Item 4 TypeScript/PostgreSQL modules instead of legacy JavaScript/SQLite copies.
jest.mock('../src/db/database', () => jest.requireActual('../src/db/database.ts'));
jest.mock('../src/routes/employeeRoutes', () => jest.requireActual('../src/routes/employeeRoutes.ts'));
jest.mock('../src/routes/eventRoutes', () => jest.requireActual('../src/routes/eventRoutes.ts'));
jest.mock('../src/services/maskingService', () => jest.requireActual('../src/services/maskingService.ts'));

import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app } from '../src/server';
import { initDatabase, pool, query } from '../src/db/database';

describe('SPEC-4.2 RF-053 – eventos, ponto, afastamentos, benefícios e histórico contratual', () => {
  let organizationId: number;
  let employeeId: number;

  beforeAll(async () => {
    await initDatabase();

    const migrationPath = path.resolve(process.cwd(), 'src/db/migrations/002_spec_4_2_rf053.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    const client = await pool.connect();
    try {
      await client.query('SET search_path TO pagamentus, public');
      await client.query(migrationSql);
      await client.query(migrationSql);
    } finally {
      client.release();
    }

    const schema = await query<{ schema: string }>(
      `SELECT current_schema() AS schema
       WHERE to_regclass('time_records') = 'pagamentus.time_records'::regclass`
    );
    expect(schema.rows[0]?.schema).toBe('pagamentus');
  });

  beforeEach(async () => {
    organizationId = 2000000000 + Math.floor(Math.random() * 100000000);
    const employee = await query<{ id: number }>(
      `INSERT INTO employees (
        organization_id, nome, cpf, cargo, salario_base, jornada, data_admissao
      )
      VALUES ($1, 'Empregado RF053', $2, 'Analista', 4000, '40h semanais', '2024-01-01')
      RETURNING id`,
      [organizationId, `rf053-${organizationId}`]
    );
    employeeId = employee.rows[0].id;
  });

  afterEach(async () => {
    await query('DELETE FROM employees WHERE organization_id = $1', [organizationId]);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('registra eventos variáveis por empregado e competência, rejeitando dados inválidos e outros tenants', async () => {
    const registered = await request(app)
      .post('/api/events')
      .set('x-organization-id', String(organizationId))
      .send({
        employee_id: employeeId,
        competencia: '2026-11',
        tipo: 'hora_extra',
        descricao: 'Horas extras',
        quantidade: 4,
        percentual: 50,
        valor: 300
      });

    expect(registered.status).toBe(201);
    expect(registered.body.competencia).toBe('2026-11');
    expect(registered.body.valor).toBe('300.00');

    const listed = await request(app)
      .get(`/api/events?competencia=2026-11&employee_id=${employeeId}`)
      .set('x-organization-id', String(organizationId));
    expect(listed.status).toBe(200);
    expect(listed.body).toHaveLength(1);

    const invalidCompetence = await request(app)
      .post('/api/events')
      .set('x-organization-id', String(organizationId))
      .send({ employee_id: employeeId, competencia: '2026-13', tipo: 'falta', valor: 10 });
    expect(invalidCompetence.status).toBe(400);

    const invalidAmount = await request(app)
      .post('/api/events')
      .set('x-organization-id', String(organizationId))
      .send({ employee_id: employeeId, competencia: '2026-11', tipo: 'falta', valor: -10 });
    expect(invalidAmount.status).toBe(400);

    const foreignTenant = await request(app)
      .post('/api/events')
      .set('x-organization-id', String(organizationId + 1))
      .send({ employee_id: employeeId, competencia: '2026-11', tipo: 'falta', valor: 10 });
    expect(foreignTenant.status).toBe(404);
  });

  it('importa lote de ponto atomicamente e valida datas, marcações, horas e vínculo tenant-aware', async () => {
    const response = await request(app)
      .post('/api/time-records/import')
      .set('x-organization-id', String(organizationId))
      .send({
        employee_id: employeeId,
        records: [
          {
            data: '2026-11-02',
            entrada: '08:00',
            saida_almoco: '12:00',
            retorno_almoco: '13:00',
            saida: '17:00',
            horas_trabalhadas: 8,
            horas_extras: 1
          },
          {
            data: '2026-11-03',
            horas_trabalhadas: 7.5,
            horas_extras: 0.5
          }
        ]
      });
    expect(response.status).toBe(201);
    expect(response.body.importados).toBe(2);

    const listed = await request(app)
      .get(`/api/time-records?employee_id=${employeeId}`)
      .set('x-organization-id', String(organizationId));
    expect(listed.status).toBe(200);
    expect(listed.body).toHaveLength(2);

    const badBatch = await request(app)
      .post('/api/time-records/import')
      .set('x-organization-id', String(organizationId))
      .send({
        employee_id: employeeId,
        records: [
          { data: '2026-11-04', horas_trabalhadas: 8, horas_extras: 1 },
          { data: '2026-11-05', horas_trabalhadas: 4, horas_extras: 5 }
        ]
      });
    expect(badBatch.status).toBe(400);

    const duplicateDate = await request(app)
      .post('/api/time-records/import')
      .set('x-organization-id', String(organizationId))
      .send({
        employee_id: employeeId,
        records: [
          { data: '2026-11-06', horas_trabalhadas: 8 },
          { data: '2026-11-06', horas_trabalhadas: 7 }
        ]
      });
    expect(duplicateDate.status).toBe(400);

    const duplicateRecord = await request(app)
      .post('/api/time-records/import')
      .set('x-organization-id', String(organizationId))
      .send({
        employee_id: employeeId,
        records: [
          { data: '2026-11-08', horas_trabalhadas: 8 },
          { data: '2026-11-02', horas_trabalhadas: 8 }
        ]
      });
    expect(duplicateRecord.status).toBe(409);

    const afterRejectedBatch = await query(
      'SELECT count(*)::integer AS total FROM time_records WHERE organization_id = $1 AND data = $2',
      [organizationId, '2026-11-08']
    );
    expect(afterRejectedBatch.rows[0].total).toBe(0);

    const foreignTenant = await request(app)
      .post('/api/time-records/import')
      .set('x-organization-id', String(organizationId + 1))
      .send({
        employee_id: employeeId,
        records: [{ data: '2026-11-07', horas_trabalhadas: 8 }]
      });
    expect(foreignTenant.status).toBe(404);
  });

  it('registra afastamentos/licenças com período coerente e bloqueia sobreposições', async () => {
    const endpoint = `/api/employees/${employeeId}/leaves`;
    const leave = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({
        tipo: 'Médico/Doença',
        data_inicio: '2026-11-10',
        data_fim: '2026-11-12',
        motivo: 'Afastamento fictício para teste'
      });
    expect(leave.status).toBe(201);

    const overlap = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({
        tipo: 'Férias',
        data_inicio: '2026-11-12',
        data_fim: '2026-11-20',
        motivo: 'Período sobreposto'
      });
    expect(overlap.status).toBe(409);

    const reversedDates = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({
        tipo: 'Férias',
        data_inicio: '2026-12-20',
        data_fim: '2026-12-10',
        motivo: 'Datas invertidas'
      });
    expect(reversedDates.status).toBe(400);

    const missingReason = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({ tipo: 'Férias', data_inicio: '2026-12-01', data_fim: '2026-12-05' });
    expect(missingReason.status).toBe(400);

    const simultaneous = await Promise.all([
      request(app)
        .post(endpoint)
        .set('x-organization-id', String(organizationId))
        .send({
          tipo: 'Férias',
          data_inicio: '2027-01-01',
          data_fim: '2027-01-10',
          motivo: 'Primeira solicitação concorrente'
        }),
      request(app)
        .post(endpoint)
        .set('x-organization-id', String(organizationId))
        .send({
          tipo: 'Férias',
          data_inicio: '2027-01-05',
          data_fim: '2027-01-15',
          motivo: 'Segunda solicitação concorrente'
        })
    ]);
    expect(simultaneous.map((response) => response.status).sort()).toEqual([201, 409]);

    const foreignTenant = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId + 1))
      .send({
        tipo: 'Férias',
        data_inicio: '2026-12-01',
        motivo: 'Empregado de outro tenant'
      });
    expect(foreignTenant.status).toBe(404);
  });

  it('vincula benefícios ao empregado com valores, descontos e vigência válidos', async () => {
    const endpoint = `/api/employees/${employeeId}/benefits`;
    const created = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({
        tipo: 'vale_refeicao',
        descricao: 'Cartão alimentação',
        valor: 600,
        desconto_empregado: 30,
        data_inicio: '2026-11-01',
        data_fim: '2026-12-31'
      });
    expect(created.status).toBe(201);

    const listed = await request(app)
      .get(endpoint)
      .set('x-organization-id', String(organizationId));
    expect(listed.status).toBe(200);
    expect(listed.body).toHaveLength(1);

    const masked = await request(app)
      .get(endpoint)
      .set('x-organization-id', String(organizationId))
      .set('x-user-role', 'consulta_assistente');
    expect(masked.body[0].valor).toBe('R$ *****,**');
    expect(masked.body[0].desconto_empregado).toBe('R$ *****,**');

    const invalidDiscount = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({
        tipo: 'plano_saude',
        valor: 100,
        desconto_empregado: 101,
        data_inicio: '2026-11-01'
      });
    expect(invalidDiscount.status).toBe(400);

    const invalidPeriod = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({
        tipo: 'vale_transporte',
        valor: 100,
        data_inicio: '2026-12-01',
        data_fim: '2026-11-01'
      });
    expect(invalidPeriod.status).toBe(400);

    const foreignTenant = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId + 1))
      .send({
        tipo: 'plano_saude',
        valor: 100,
        data_inicio: '2026-11-01'
      });
    expect(foreignTenant.status).toBe(404);
  });

  it('audita mudanças de cargo, jornada, departamento e regime sem perder o histórico', async () => {
    const endpoint = `/api/employees/${employeeId}/contract-changes`;
    const changed = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({
        tipo_alteracao: 'Alteração contratual',
        descricao: 'Promoção e mudança de regime',
        novo_cargo: 'Coordenador',
        nova_jornada: '40h semanais',
        novo_departamento: 'Financeiro',
        novo_regime: 'hibrido',
        novo_salario: 5200,
        data_alteracao: '2026-11-01'
      });
    expect(changed.status).toBe(201);
    expect(changed.body.cargo_anterior).toBe('Analista');
    expect(changed.body.novo_cargo).toBe('Coordenador');
    expect(changed.body.jornada_anterior).toBe('40h semanais');
    expect(changed.body.novo_departamento).toBe('Financeiro');
    expect(changed.body.novo_regime).toBe('hibrido');

    const employee = await query(
      'SELECT cargo, jornada, departamento, regime_contratual, salario_base FROM employees WHERE organization_id = $1 AND id = $2',
      [organizationId, employeeId]
    );
    expect(employee.rows[0]).toMatchObject({
      cargo: 'Coordenador',
      jornada: '40h semanais',
      departamento: 'Financeiro',
      regime_contratual: 'hibrido',
      salario_base: '5200.00'
    });

    const invalidChange = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId))
      .send({ novo_salario: -1 });
    expect(invalidChange.status).toBe(400);

    const foreignTenant = await request(app)
      .post(endpoint)
      .set('x-organization-id', String(organizationId + 1))
      .send({ novo_cargo: 'Diretor' });
    expect(foreignTenant.status).toBe(404);
  });

  it('impede referências cruzadas de empregado entre organizações no próprio banco', async () => {
    await expect(
      query(
        `INSERT INTO benefits (organization_id, employee_id, tipo, valor, data_inicio)
         VALUES ($1, $2, 'plano_saude', 100, '2026-11-01')`,
        [organizationId + 1, employeeId]
      )
    ).rejects.toMatchObject({ code: '23503' });
  });
});
