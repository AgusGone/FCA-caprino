import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'cabras.db');
const db = new Database(dbPath);

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await req.json();
    
    const updateFields = Object.keys(body)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(body).map((v: any) => 
      typeof v === 'object' ? JSON.stringify(v) : v
    );
    
    const stmt = db.prepare(`
      UPDATE cabras SET ${updateFields} WHERE id = ?
    `);
    
    stmt.run(...values, id);
    
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
    console.error('PATCH /api/cabras/[id] error:', error);
    return Response.json(
      { error: 'No se pudo actualizar la cabra' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    
    db.prepare('DELETE FROM cabras WHERE id = ?').run(id);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cabras/[id] error:', error);
    return Response.json(
      { error: 'No se pudo eliminar la cabra' },
      { status: 500 }
    );
  }
}
