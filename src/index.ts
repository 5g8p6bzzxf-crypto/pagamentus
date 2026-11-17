import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Pagamentus API] Servidor iniciado na porta ${PORT}`);
  console.log(`[Plano de Contas] Módulo contábil ativo (SPEC-2.1)`);
});
