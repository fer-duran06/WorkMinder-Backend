// services/SubjectsService.ts
import { db } from '@/lib/db/mysql';

export class SubjectsService {

  static async getByUser(usuarioId: string) {
    return await db.query<any>(
      `SELECT m.*, pa.nombre AS periodo_nombre, pa.es_activo AS periodo_activo
       FROM materias m
       INNER JOIN periodos_academicos pa ON m.periodo_id = pa.id
       WHERE pa.usuario_id = ?
       ORDER BY pa.es_activo DESC, m.nombre ASC`,
      [usuarioId]
    );
  }

  static async getActiveByUser(usuarioId: string) {
    return await db.query<any>(
      `SELECT m.*
       FROM materias m
       INNER JOIN periodos_academicos pa ON m.periodo_id = pa.id
       WHERE pa.usuario_id = ? AND pa.es_activo = TRUE
       ORDER BY m.nombre ASC`,
      [usuarioId]
    );
  }

  static async getById(id: string, usuarioId: string) {
    const result = await db.query<any>(
      `SELECT m.*
       FROM materias m
       INNER JOIN periodos_academicos pa ON m.periodo_id = pa.id
       WHERE m.id = ? AND pa.usuario_id = ?`,
      [id, usuarioId]
    );
    return result[0] || null;
  }

  static async create(data: {
    periodo_id: string;
    nombre: string;
    nombre_profesor?: string;
    creditos?: number;
    color_hex?: string;
  }) {
    await db.execute(
      `INSERT INTO materias (id, periodo_id, nombre, nombre_profesor, creditos, color_hex)
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [data.periodo_id, data.nombre, data.nombre_profesor || null, data.creditos || 0, data.color_hex || '#6B7280']
    );
    const result = await db.query<any>(
      'SELECT * FROM materias WHERE periodo_id = ? AND nombre = ? ORDER BY creado_en DESC LIMIT 1',
      [data.periodo_id, data.nombre]
    );
    return result[0];
  }

  static async update(id: string, usuarioId: string, data: {
    nombre?: string;
    nombre_profesor?: string;
    creditos?: number;
    color_hex?: string;
  }) {
    const materia = await this.getById(id, usuarioId);
    if (!materia) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre); }
    if (data.nombre_profesor !== undefined) { fields.push('nombre_profesor = ?'); values.push(data.nombre_profesor); }
    if (data.creditos !== undefined) { fields.push('creditos = ?'); values.push(data.creditos); }
    if (data.color_hex !== undefined) { fields.push('color_hex = ?'); values.push(data.color_hex); }

    if (!fields.length) return materia;

    values.push(id);
    await db.execute(`UPDATE materias SET ${fields.join(', ')} WHERE id = ?`, values);
    return await this.getById(id, usuarioId);
  }

  static async delete(id: string, usuarioId: string) {
    const materia = await this.getById(id, usuarioId);
    if (!materia) return false;
    await db.execute('DELETE FROM materias WHERE id = ?', [id]);
    return true;
  }
}