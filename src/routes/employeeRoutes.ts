import { Router, Request, Response } from 'express';
import { query } from '../db/database';
import { maskObject } from '../services/maskingService';
import { Employee } from '../types';

const router = Router();

// GET /api/employees - Lista todos os empregados
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const orgId = req.organizationId || 1;

    let sql = 'SELECT * FROM employees WHERE organization_id = $1';
    const params: any[] = [orgId];

    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }
    sql += ' ORDER BY id ASC';

    const result = await query<Employee>(sql, params);
    res.json(maskObject(result.rows, req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/employees/:id - Detalhes do empregado com histórico contratual e licenças
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const empRes = await query<Employee>(
      'SELECT * FROM employees WHERE organization_id = $1 AND id = $2',
      [orgId, req.params.id]
    );

    if (empRes.rows.length === 0) {
      res.status(404).json({ error: 'Empregado não encontrado.' });
      return;
    }

    const emp = empRes.rows[0];

    const changesRes = await query(
      'SELECT * FROM contract_changes WHERE organization_id = $1 AND employee_id = $2 ORDER BY data_alteracao DESC',
      [orgId, emp.id]
    );
    const leavesRes = await query(
      'SELECT * FROM leaves WHERE organization_id = $1 AND employee_id = $2 ORDER BY data_inicio DESC',
      [orgId, emp.id]
    );

    const fullData = {
      ...emp,
      alteracoesContratuais: changesRes.rows,
      afastamentos: leavesRes.rows
    };

    res.json(maskObject(fullData, req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees - Cadastra novo empregado (RF-051)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { nome, cpf, cargo, salario_base, jornada, data_admissao, status, dependentes } = req.body;

    if (!nome || !cpf || !cargo || salario_base === undefined || !jornada || !data_admissao) {
      res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
      return;
    }

    // Unicidade de CPF no escopo da organização
    const existing = await query(
      'SELECT id FROM employees WHERE organization_id = $1 AND cpf = $2',
      [orgId, cpf.trim()]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Já existe um empregado cadastrado com este CPF.' });
      return;
    }

    const insertRes = await query(`
      INSERT INTO employees (organization_id, nome, cpf, cargo, salario_base, jornada, data_admissao, status, dependentes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      orgId,
      nome.trim(),
      cpf.trim(),
      cargo.trim(),
      Number(salario_base),
      jornada.trim(),
      data_admissao,
      status || 'ativo',
      Number(dependentes) || 0
    ]);

    const created = insertRes.rows[0];

    await query(`
      INSERT INTO contract_changes (organization_id, employee_id, tipo_alteracao, descricao, salario_anterior, novo_salario, cargo_anterior, novo_cargo, data_alteracao)
      VALUES ($1, $2, 'Contrato Inicial', 'Admissão formal do empregado no quadro da empresa', NULL, $3, NULL, $4, $5)
    `, [orgId, created.id, Number(salario_base), cargo.trim(), data_admissao]);

    await query(`
      INSERT INTO payroll_approval_logs (organization_id, competencia, usuario, perfil, acao, detalhes)
      VALUES ($1, 'GERAL', 'Douglas (RH)', 'RH/Admin', 'Cadastro de Empregado', $2)
    `, [orgId, `Empregado criado: ${nome} (Cargo: ${cargo}, Salário: R$ ${salario_base})`]);

    res.status(201).json(maskObject(created, req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employees/:id - Atualiza dados cadastrais
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { id } = req.params;

    const currentRes = await query<Employee>(
      'SELECT * FROM employees WHERE organization_id = $1 AND id = $2',
      [orgId, id]
    );

    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'Empregado não encontrado.' });
      return;
    }

    const current = currentRes.rows[0];
    const { nome, cpf, cargo, salario_base, jornada, data_admissao, status, dependentes } = req.body;

    const novoSalario = Number(salario_base);
    const novoCargo = cargo ? cargo.trim() : current.cargo;

    if (novoSalario !== parseFloat(String(current.salario_base)) || novoCargo !== current.cargo || (jornada && jornada !== current.jornada)) {
      let tipo = 'Alteração Cadastral';
      let desc = 'Atualização contratual';
      if (novoSalario > parseFloat(String(current.salario_base))) {
        tipo = 'Reajuste Salarial';
        desc = `Aumento salarial de R$ ${current.salario_base} para R$ ${novoSalario}`;
      } else if (novoCargo !== current.cargo) {
        tipo = 'Mudança de Cargo / Promoção';
        desc = `Mudança de cargo de "${current.cargo}" para "${novoCargo}"`;
      }

      await query(`
        INSERT INTO contract_changes (organization_id, employee_id, tipo_alteracao, descricao, salario_anterior, novo_salario, cargo_anterior, novo_cargo, data_alteracao)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
      `, [orgId, id, tipo, desc, current.salario_base, novoSalario, current.cargo, novoCargo]);
    }

    const updateRes = await query(`
      UPDATE employees
      SET nome = COALESCE($1, nome),
          cpf = COALESCE($2, cpf),
          cargo = COALESCE($3, cargo),
          salario_base = COALESCE($4, salario_base),
          jornada = COALESCE($5, jornada),
          data_admissao = COALESCE($6, data_admissao),
          status = COALESCE($7, status),
          dependentes = COALESCE($8, dependentes),
          updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = $9 AND id = $10
      RETURNING *
    `, [
      nome ? nome.trim() : null,
      cpf ? cpf.trim() : null,
      cargo ? cargo.trim() : null,
      salario_base !== undefined ? Number(salario_base) : null,
      jornada ? jornada.trim() : null,
      data_admissao || null,
      status || null,
      dependentes !== undefined ? Number(dependentes) : null,
      orgId,
      id
    ]);

    res.json(maskObject(updateRes.rows[0], req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/employees/:id - Inativa empregado (lógico / RB-007)
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { id } = req.params;

    const currentRes = await query<Employee>(
      'SELECT * FROM employees WHERE organization_id = $1 AND id = $2',
      [orgId, id]
    );

    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'Empregado não encontrado.' });
      return;
    }

    await query(
      `UPDATE employees SET status = 'inativo', updated_at = CURRENT_TIMESTAMP WHERE organization_id = $1 AND id = $2`,
      [orgId, id]
    );

    await query(`
      INSERT INTO payroll_approval_logs (organization_id, competencia, usuario, perfil, acao, detalhes)
      VALUES ($1, 'GERAL', 'Douglas (RH)', 'RH/Admin', 'Inativação de Empregado', $2)
    `, [orgId, `Empregado ID ${id} (${currentRes.rows[0].nome}) marcado como inativo`]);

    res.json({ message: 'Empregado inativado com sucesso.', id: Number(id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees/:id/contract-changes - Registra alteração contratual manual
router.post('/:id/contract-changes', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { id } = req.params;
    const { tipo_alteracao, descricao, salario_anterior, novo_salario, cargo_anterior, novo_cargo, data_alteracao } = req.body;

    const currentRes = await query<Employee>(
      'SELECT * FROM employees WHERE organization_id = $1 AND id = $2',
      [orgId, id]
    );

    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'Empregado não encontrado.' });
      return;
    }

    const current = currentRes.rows[0];

    const result = await query(`
      INSERT INTO contract_changes (organization_id, employee_id, tipo_alteracao, descricao, salario_anterior, novo_salario, cargo_anterior, novo_cargo, data_alteracao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      orgId,
      id,
      tipo_alteracao || 'Alteração Contratual',
      descricao || 'Registro formal de alteração',
      salario_anterior !== undefined ? Number(salario_anterior) : current.salario_base,
      novo_salario !== undefined ? Number(novo_salario) : current.salario_base,
      cargo_anterior || current.cargo,
      novo_cargo || current.cargo,
      data_alteracao || new Date().toISOString().split('T')[0]
    ]);

    if (novo_salario !== undefined || novo_cargo) {
      await query(`
        UPDATE employees
        SET salario_base = COALESCE($1, salario_base),
            cargo = COALESCE($2, cargo),
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = $3 AND id = $4
      `, [novo_salario !== undefined ? Number(novo_salario) : null, novo_cargo || null, orgId, id]);
    }

    res.status(201).json(maskObject(result.rows[0], req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employees/:id/leaves - Registra afastamento/licença
router.post('/:id/leaves', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { id } = req.params;
    const { tipo, data_inicio, data_fim, motivo } = req.body;

    const currentRes = await query<Employee>(
      'SELECT * FROM employees WHERE organization_id = $1 AND id = $2',
      [orgId, id]
    );

    if (currentRes.rows.length === 0) {
      res.status(404).json({ error: 'Empregado não encontrado.' });
      return;
    }

    if (!tipo || !data_inicio) {
      res.status(400).json({ error: 'Tipo e data de início do afastamento são obrigatórios.' });
      return;
    }

    const result = await query(`
      INSERT INTO leaves (organization_id, employee_id, tipo, data_inicio, data_fim, motivo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [orgId, id, tipo, data_inicio, data_fim || null, motivo || null]);

    await query(
      `UPDATE employees SET status = 'afastado', updated_at = CURRENT_TIMESTAMP WHERE organization_id = $1 AND id = $2`,
      [orgId, id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
