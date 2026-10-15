const fs = require('fs');
const { Pool } = require('pg');

const connStr = 'postgresql://neondb_owner:npg_HSn17zBVDlQy@ep-broad-resonance-b5zw62id-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connStr,
});

async function run() {
  console.log('Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  try {
    console.log('Reading migration file...');
    let fullSql = fs.readFileSync('c:/Users/ADMIN/Downloads/src bomsito/migrations/00001_ticket_transcripts_v5.sql', 'utf8');
    const downIdx = fullSql.indexOf('-- +goose Down');
    const upSql = downIdx !== -1 ? fullSql.substring(0, downIdx) : fullSql;
    const cleanSql = upSql.replace(/-- \+goose Up/g, '');
    
    console.log('Executing UP migration on Neon database...');
    await client.query(cleanSql);
    console.log('SUCCESS: Migration 00001_ticket_transcripts_v5 UP executed successfully!');

    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log('Public tables in Neon DB:', res.rows.map(r => r.table_name));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
