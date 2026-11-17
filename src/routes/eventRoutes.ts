import { Router, Request, Response } from 'express';
import { query } from '../db/database';
import { maskObject } from '../services/maskingService';
import { Employee } from '../types';

const router = Router();

// GET /api/events - Lista eventos variáveis
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { competencia, employee_id } = req.query;

    let sql = `
      SELECT v.*, e.nome as employee_nome, e.cargo as employee_cargo
      FROM variable_events v
      JOIN employees e ON v.employee_id = e.id
      WHERE v.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (competencia) {
      params.push(competencia);
      sql += ` AND v.competencia = $${params.length}`;
    }
    if (employee_id) {
      params.push(employee_id);
      sql += ` AND v.employee_id = $${params.length}`;
    }

    sql += ' ORDER BY v.id DESC';

    const result = await query(sql, params);
    res.json(maskObject(result.rows, req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/events - Registra novo evento variável
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { employee_id, competencia, tipo, descricao, quantidade, percentual, valor } = req.body;

    if (!employee_id || !competencia || !tipo || valor === undefined) {
      res.status(400).json({ error: 'Empregado, competência, tipo e valor são obrigatórios.' });
      return;
    }

    const empRes = await query<Employee>(
      'SELECT id, nome, salario_base, jornada FROM employees WHERE organization_id = $1 AND id = $2',
      [orgId, employee_id]
    );

    if (empRes.rows.length === 0) {
      res.status(404).json({ error: 'Empregado não encontrado.' });
      return;
    }

    const emp = empRes.rows[0];
    let calculatedValue = Number(valor);

    if (calculatedValue === 0 && quantidade > 0) {
      const divisor = emp.jornada.includes('40h') ? 200 : 220;
      const valorHora = parseFloat(String(emp.salario_base)) / divisor;

      if (tipo === 'hora_extra') {
        const fator = 1 + ((Number(percentual) || 50) / 100);
        calculatedValue = Number((valorHora * fator * Number(quantidade)).toFixed(2));
      } else if (tipo === 'falta') {
        const valorDia = parseFloat(String(emp.salario_base)) / 30;
        calculatedValue = Number((valorDia * Number(quantidade)).toFixed(2));
      }
    }

    const insertRes = await query(`
      INSERT INTO variable_events (organization_id, employee_id, competencia, tipo, descricao, quantidade, percentual, valor)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      orgId,
      employee_id,
      competencia.trim(),
      tipo.trim(),
      descricao ? descricao.trim() : `${tipo} - ${quantidade || ''}`,
      Number(quantidade) || 0,
      Number(percentual) || 0,
      calculatedValue
    ]);

    const created = insertRes.rows[0];
    created.employee_nome = emp.nome;

    res.status(201).json(maskObject(created, req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/events/:id - Remove evento variável
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const { id } = req.params;

    const findRes = await query('SELECT * FROM variable_events WHERE organization_id = $1 AND id = $2', [orgId, id]);
    if (findRes.rows.length === 0) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }

    await query('DELETE FROM variable_events WHERE organization_id = $1 AND id = $2', [orgId, id]);
    res.json({ message: 'Evento excluído com sucesso.', id: Number(id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/leaves - Lista todos os afastamentos
router.get('/leaves', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const result = await query(`
      SELECT l.*, e.nome as employee_nome, e.cargo as employee_cargo
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.organization_id = $1
      ORDER BY l.data_inicio DESC
    `, [orgId]);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/contract-changes - Lista histórico de alterações contratuais
router.get('/contract-changes', async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organizationId || 1;
    const result = await query(`
      SELECT cc.*, e.nome as employee_nome
      FROM contract_changes cc
      JOIN employees e ON cc.employee_id = e.id
      WHERE cc.organization_id = $1
      ORDER BY cc.data_alteracao DESC
    `, [orgId]);
    res.json(maskObject(result.rows, req.isRhAdmin));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
