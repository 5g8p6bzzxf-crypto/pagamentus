import { Router, Request, Response } from 'express';
import { query } from '../db/database';

const router = Router();

// GET /api/parameters - Lista parâmetros do sistema
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM system_parameters ORDER BY chave ASC');
    res.json(result.rows.map(r => ({ ...r, valor: parseFloat(r.valor) })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/parameters/:chave - Atualiza valor do parâmetro (restrito a RH/Admin)
router.put('/:chave', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isRhAdmin) {
      res.status(403).json({ error: 'Apenas RH/Admin pode atualizar parâmetros.' });
      return;
    }

    const orgId = req.organizationId || 1;
    const { chave } = req.params;
    const { valor } = req.body;

    if (valor === undefined || isNaN(valor)) {
      res.status(400).json({ error: 'Valor numérico válido é obrigatório.' });
      return;
    }

    await query('UPDATE system_parameters SET valor = $1 WHERE chave = $2', [Number(valor), chave]);

    await query(`
      INSERT INTO payroll_approval_logs (organization_id, competencia, usuario, perfil, acao, detalhes)
      VALUES ($1, 'CONFIG', 'Douglas (RH)', 'RH/Admin', 'Alteração de Parâmetro', $2)
    `, [orgId, `Parâmetro ${chave} alterado para ${valor}`]);

    res.json({ success: true, chave, valor: Number(valor) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
