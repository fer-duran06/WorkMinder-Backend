// lib/db/mysql.ts
import mysql from 'mysql2/promise';

// Pool de conexiones (reutiliza conexiones para mejor performance)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'workminder_mvp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

// Helper para ejecutar queries
export const db = {
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  },

  async insert(sql: string, params?: any[]): Promise<string> {
    const [result] = await pool.execute(sql, params);
    return (result as any).insertId;
  },

  async execute(sql: string, params?: any[]): Promise<any> {
    const [result] = await pool.execute(sql, params);
    return result;
  }
};

// Test de conexión
export async function testConnection() {
  try {
    await pool.query('SELECT 1 as test');
    console.log('✅ MySQL connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}