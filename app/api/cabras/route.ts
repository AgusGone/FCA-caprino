import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';

const dbPath = path.join(process.cwd(), 'data', 'cabras.db');
const db = new Database(dbPath);

// Crear tabla si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS cabras (
    id TEXT PRIMARY KEY,
    caravana TEXT NOT NULL,
    nacimiento TEXT NOT NULL,
    edad TEXT,
    estado TEXT NOT NULL,
    partos INTEGER DEFAULT 0,
    promedio REAL DEFAULT 0.0,
    dot TEXT DEFAULT 'verde',
    produccion TEXT DEFAULT '[]',
    historialPartos TEXT DEFAULT '[]',
    sanidad TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export async function GET() {
  try {
    const cabras = db.prepare('SELECT * FROM cabras ORDER BY id DESC').all();
    
    const cabrasParsed = (cabras as any[]).map((c) => ({
      ...c,
      produccion: JSON.parse(c.produccion || '[]'),
      historialPartos: JSON.parse(c.historialPartos || '[]'),
      sanidad: JSON.parse(c.sanidad || '[]'),
    }));
    
    return Response.json({ cabras: cabrasParsed });
  } catch (error) {
    console.error('GET /api/cabras error:', error);
    return Response.json(
      { error: 'No se pudieron cargar las cabras' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO cabras (id, caravana, nacimiento, edad, estado, partos, promedio, dot, produccion, historialPartos, sanidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      body.caravana,
      body.nacimiento,
      body.edad || '',
      body.estado,
      body.partos || 0,
      body.promedio || 0,
      body.dot || 'verde',
      JSON.stringify(body.produccion || []),
      JSON.stringify(body.historialPartos || []),
      JSON.stringify(body.sanidad || [])
    );
    
    const cabra = db.prepare('SELECT * FROM cabras WHERE id = ?').get(id);
    
    return Response.json({
      cabra: {
        ...cabra,
        produccion: JSON.parse((cabra as any).produccion),
        historialPartos: JSON.parse((cabra as any).historialPartos),
        sanidad: JSON.parse((cabra as any).sanidad),
      }
    });
  } catch (error) {
    console.error('POST /api/cabras error:', error);
    return Response.json(
      { error: 'No se pudo crear la cabra' },
      { status: 500 }
    );
  }
}
