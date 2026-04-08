// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from 'mssql';

const config: sql.config = {
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD!,
  server: process.env.MSSQL_SERVER || 'localhost',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE || 'exam_system',
  options: { encrypt: false, trustServerCertificate: true },
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO dbo.users (name, email, role, status, createdAt)
      VALUES (${name}, ${email}, ${role}, 'Active', GETDATE())
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  } finally {
    await sql.close();
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const id = Number(formData.get('id'));
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  try {
    await sql.connect(config);
    await sql.query`
      UPDATE dbo.users
      SET name = ${name}, email = ${email}, role = ${role}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error editing user:', error);
    return NextResponse.json({ error: 'Failed to edit user' }, { status: 500 });
  } finally {
    await sql.close();
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));

  try {
    await sql.connect(config);
    await sql.query`DELETE FROM dbo.users WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  } finally {
    await sql.close();
  }
}