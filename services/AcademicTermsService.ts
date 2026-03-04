// services/AcademicTermsService.ts
import { db } from '@/lib/db/mysql';

export class AcademicTermsService {

  static async getByUser(usuarioId: string) {
    return await db.query<any>(
      `SELECT pa.*, COUNT(m.id) AS total_materias
       FROM periodos_academicos pa
       LEFT JOIN materias m ON m.periodo_id = pa.id
       WHERE pa.usuario_id = ?
       GROUP BY pa.id
       ORDER BY pa.es_activo DESC, pa.fecha_inicio DESC`,
      [usuarioId]
    );
  }

  static async getById(id: string, usuarioId: string) {
    const result = await db.query<any>(
      'SELECT * FROM periodos_academicos WHERE id = ? AND usuario_id = ?',
      [id, usuarioId]
    );
    return result[0] || null;
  }

  static async create(usuarioId: string, data: {
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    es_activo?: boolean;
  }) {
    if (data.es_activo) {
      await db.execute(
        'UPDATE periodos_academicos SET es_activo = FALSE WHERE usuario_id = ?',
        [usuarioId]
      );
    }
    await db.execute(
      `INSERT INTO periodos_academicos (id, usuario_id, nombre, fecha_inicio, fecha_fin, es_activo)
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [usuarioId, data.nombre, data.fecha_inicio, data.fecha_fin, data.es_activo ?? true]
    );
    const result = await db.query<any>(
      'SELECT * FROM periodos_academicos WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 1',
      [usuarioId]
    );
    return result[0];
  }

  static async update(id: string, usuarioId: string, data: {
    nombre?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    es_activo?: boolean;
  }) {
    const periodo = await this.getById(id, usuarioId);
    if (!periodo) return null;

    if (data.es_activo === true) {
      await db.execute(
        'UPDATE periodos_academicos SET es_activo = FALSE WHERE usuario_id = ? AND id != ?',
        [usuarioId, id]
      );
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre); }
    if (data.fecha_inicio !== undefined) { fields.push('fecha_inicio = ?'); values.push(data.fecha_inicio); }
    if (data.fecha_fin !== undefined) { fields.push('fecha_fin = ?'); values.push(data.fecha_fin); }
    if (data.es_activo !== undefined) { fields.push('es_activo = ?'); values.push(data.es_activo); }

    if (!fields.length) return periodo;

    values.push(id);
    await db.execute(`UPDATE periodos_academicos SET ${fields.join(', ')} WHERE id = ?`, values);
    return await this.getById(id, usuarioId);
  }

  static async delete(id: string, usuarioId: string) {
    const periodo = await this.getById(id, usuarioId);
    if (!periodo) return false;
    await db.execute('DELETE FROM periodos_academicos WHERE id = ?', [id]);
    return true;
  }
}