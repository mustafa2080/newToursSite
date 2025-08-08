#!/usr/bin/env node

import { initializeDatabase, resetDatabase } from '../src/config/init-db.js';

const command = process.argv[2];

async function main() {
  console.log('🚀 Database Setup Script');
  console.log('========================');

  switch (command) {
    case 'init':
      console.log('Initializing database...');
      const initSuccess = await initializeDatabase();
      if (initSuccess) {
        console.log('✅ Database initialized successfully!');
        process.exit(0);
      } else {
        console.log('❌ Database initialization failed!');
        process.exit(1);
      }
      break;

    case 'reset':
      console.log('⚠️  WARNING: This will delete all data!');
      console.log('Resetting database...');
      const resetSuccess = await resetDatabase();
      if (resetSuccess) {
        console.log('✅ Database reset and reinitialized successfully!');
        process.exit(0);
      } else {
        console.log('❌ Database reset failed!');
        process.exit(1);
      }
      break;

    default:
      console.log('Usage:');
      console.log('  npm run db:init  - Initialize database with schema and default data');
      console.log('  npm run db:reset - Reset database (WARNING: Deletes all data)');
      console.log('');
      console.log('Available commands:');
      console.log('  init   - Initialize database');
      console.log('  reset  - Reset database');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
