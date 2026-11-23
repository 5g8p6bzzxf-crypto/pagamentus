import * as fs from 'fs';
import * as path from 'path';
import { DatabaseConnection } from './connection';

/**
 * Utilitário para executar as migrações SQL no banco de dados
 */
export async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'));

  // Ordena os arquivos em ordem alfabética (001_, 002_, etc.)
  files.sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Executa a migração dentro de uma transação
    await DatabaseConnection.transaction(async (client) => {
      console.log(`Aplicando migração: ${file}`);
      await client.query(sql);
    });
  }
}

// Permite execução direta via CLI (ex.: npx ts-node src/database/migrate.ts)
if (require.main === module) {
  runMigrations()
    .then(async () => {
      console.log('Migrações aplicadas com sucesso.');
      await DatabaseConnection.closePool();
    })
    .catch(async (error) => {
      console.error('Falha ao aplicar migrações:', error);
      await DatabaseConnection.closePool();
      process.exit(1);
    });
}
