// lib/middleware/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function verifyAuth(request: NextRequest): Promise<string> {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No se proporcionó token de autenticación');
    }

    const token = authHeader.substring(7); // Quitar "Bearer "
    
    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as JWTPayload;

    return decoded.userId;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}