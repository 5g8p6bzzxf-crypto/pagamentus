// Redirecionamento para a versão TypeScript compilada
try {
  require('./dist/server');
} catch (e) {
  require('tsx/cjs');
  require('./src/server.ts');
}
