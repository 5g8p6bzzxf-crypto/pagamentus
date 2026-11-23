import { Router, Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../db/database';
import {
  isNonNegativeNumber,
  isPositiveInteger,
  isValidDate,
  isValidTime
} from '../services/rf053Validation';

const router = Router();

interface TimeRecordInput {
  data: string;
  entrada?: string | null;
  saida_almoco?: string | null;
  retorno_almoco?: string | null;
  saida?: string | null;
  horas_trabalhadas: number;
  horas_extras?: number;
  observacao?: string | null;
}

function isValidTimeRecord(record: TimeRecordInput): boolean {
  if (!record || typeof record !== 'object' || Array.isArray(record)
    || !isValidDate(record.data)
    || !isNonNegativeNumber(record.horas_trabalhadas)
    || record.horas_trabalhadas > 24
    || (record.horas_extras !== undefined
      && (!isNonNegativeNumber(record.horas_extras) || record.horas_extras > record.horas_trabalhadas))
    || (record.observacao !== undefined
      && record.observacao !== null
      && typeof record.observacao !== 'string')) {
    return false;
  }

  const marks: Array<string | null> = [record.entrada, record.saida_almoco, record.retorno_almoco, record.saida]
    .map((mark) => mark === undefined || mark === null || mark === '' ? null : mark);

  if (marks.some((mark) => mark !== null && !isValidTime(mark))) {
    return false;
  }

  const [entrada, saidaAlmoco, retornoAlmoco, saida] = marks;
  if (marks.every((mark) => mark === null)) {
    return true;
  }
  if (!entrada || !saida || entrada >= saida) {
    return false;
  }
  if ((saidaAlmoco === null) !== (retornoAlmoco === null)) {
    return false;
  }

  if (saidaAlmoco === null || retornoAlmoco === null) {
    return true;
  }
  return entrada < saidaAlmoco && saidaAlmoco < retornoAlmoco && retornoAlmoco < saida;
}

function respondWithDatabaseError(error: any, res: Response): void {
  if (error.code === '23505') {
    res.status(409).json({ error: 'Já existe um registro de ponto para o empregado nesta data.' });
    return;
  }
  if (error.code === '23503') {
    res.status(404).json({ error: 'Empregado não encontrado nesta organização.' });
    return;
  }
  if (error.code === '23514') {
    res.status(400).json({ error: 'O registro de ponto viola uma regra de validação.' });
    return;
  }

  console.error('Falha ao consultar registros de ponto:', error);
  res.status(500).json({ error: 'Não foi possível processar os registros de ponto.' });
}

router.post('/import', async (req: Request, res: Response): Promise<void> => {
  const { employee_id, records } = req.body;

  if (!isPositiveInteger(employee_id)) {
    res.status(400).json({ error: 'Informe um empregado válido.' });
    return;
  }
  if (!Array.isArray(records) || records.length === 0 || records.length > 500) {
    res.status(400).json({ error: 'Informe entre 1 e 500 registros de ponto.' });
    return;
  }
  if (!records.every((record: TimeRecordInput) => record && isValidTimeRecord(record))) {
    res.status(400).json({ error: 'Há registros com datas, marcações ou horas inválidas.' });
    return;
  }

  const dates = records.map((record: TimeRecordInput) => record.data);
  if (new Set(dates).size !== dates.length) {
    res.status(400).json({ error: 'O lote contém mais de um registro para a mesma data.' });
    return;
  }

  const organizationId = req.organizationId || 1;
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const employee = await client.query(
      'SELECT id FROM employees WHERE organization_id = $1 AND id = $2 FOR UPDATE',
      [organizationId, employee_id]
    );
    if (employee.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Empregado não encontrado nesta organização.' });
      return;
    }

    const inserted = [];
    for (const record of records as TimeRecordInput[]) {
      const result = await client.query(
        `INSERT INTO time_records (
          organization_id, employee_id, data, entrada, saida_almoco, retorno_almoco, saida,
          horas_trabalhadas, horas_extras, observacao
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          organizationId,
          employee_id,
          record.data,
          record.entrada || null,
          record.saida_almoco || null,
          record.retorno_almoco || null,
          record.saida || null,
          record.horas_trabalhadas,
          record.horas_extras ?? 0,
          record.observacao?.trim() || null
        ]
      );
      inserted.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ importados: inserted.length, registros: inserted });
  } catch (error: any) {
    if (client) {
      await client.query('ROLLBACK');
    }
    respondWithDatabaseError(error, res);
  } finally {
    client?.release();
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { employee_id, data_inicio, data_fim } = req.query;
  const employeeId = employee_id === undefined ? null : Number(employee_id);
  if ((employee_id !== undefined
      && (typeof employee_id !== 'string' || !isPositiveInteger(employeeId)))
    || (data_inicio !== undefined && !isValidDate(data_inicio))
    || (data_fim !== undefined && !isValidDate(data_fim))
    || (typeof data_inicio === 'string' && typeof data_fim === 'string' && data_inicio > data_fim)) {
    res.status(400).json({ error: 'Filtros de consulta de ponto inválidos.' });
    return;
  }

  try {
    const organizationId = req.organizationId || 1;
    const result = await pool.query(
      `SELECT * FROM time_records
       WHERE organization_id = $1
         AND ($2::integer IS NULL OR employee_id = $2)
         AND ($3::date IS NULL OR data >= $3)
         AND ($4::date IS NULL OR data <= $4)
       ORDER BY data DESC, employee_id`,
      [
        organizationId,
        employeeId,
        data_inicio || null,
        data_fim || null
      ]
    );
    res.json(result.rows);
  } catch (error: any) {
    respondWithDatabaseError(error, res);
  }
});

export default router;
