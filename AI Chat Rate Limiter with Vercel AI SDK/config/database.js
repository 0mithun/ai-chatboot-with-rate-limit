import dotenv from 'dotenv'
import { Pool } from 'pg';

dotenv.config()

const connection = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

connection.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

connection.on('error', (err) => {
  console.error('Database connection error:', err);
});


 const runMigration = ()=> {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          plan VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `

    connection.query(query)
    console.log("Database migration success!")
  } catch (error) {
       console.log("Database migration failed!")
  }
}

export default connection

export {
  runMigration
}