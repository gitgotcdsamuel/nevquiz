'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';

// Use the DATABASE_URL from your .env.local
const connectionString = process.env.DATABASE_URL!;

export async function addUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  try {
    const pool = await sql.connect(connectionString);
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('role', sql.NVarChar, role)
      .query(`
        INSERT INTO dbo.users (name, email, role, status, createdAt)
        VALUES (@name, @email, @role, 'Active', GETDATE())
      `);
    await pool.close();
  } catch (error) {
    console.error('Error adding user:', error);
    throw new Error('Failed to add user');
  }
  
  revalidatePath('/admin/users');
}

export async function editUser(formData: FormData) {
  const id = Number(formData.get('id'));
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  try {
    const pool = await sql.connect(connectionString);
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('role', sql.NVarChar, role)
      .query(`
        UPDATE dbo.users
        SET name = @name, email = @email, role = @role
        WHERE id = @id
      `);
    await pool.close();
  } catch (error) {
    console.error('Error editing user:', error);
    throw new Error('Failed to edit user');
  }
  
  revalidatePath('/admin/users');
}

export async function deleteUser(id: number) {
  try {
    const pool = await sql.connect(connectionString);
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM dbo.users WHERE id = @id`);
    await pool.close();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
  
  revalidatePath('/admin/users');
}

// Optional: Add a function to get users if needed
export async function getUsers() {
  try {
    const pool = await sql.connect(connectionString);
    const result = await pool.request().query(`
      SELECT id, name, email, role, status, createdAt 
      FROM dbo.users 
      ORDER BY createdAt DESC
    `);
    await pool.close();
    return result.recordset;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}