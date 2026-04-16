import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';

function parseCSVLine(line: string) {
  // Simple CSV parser for this specific format
  const parts = line.split(',');
  return parts.map(p => p.trim());
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!url) {
    return NextResponse.json({ error: 'PocketBase URL is not configured' }, { status: 500 });
  }

  const pb = new PocketBase(url);

  // Authenticate as Admin using credentials from .env.local
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Admin credentials not configured in .env.local' }, { status: 500 });
  }

  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate as admin. Check .env.local credentials.' }, { status: 401 });
  }

  const courseId = 'kvwxjfthck7ciuy';
  const csvPath = path.resolve(process.cwd(), 'data', 'PRUEBA.csv');
  
  if (!fs.existsSync(csvPath)) {
    return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const results = {
    total: dataLines.length,
    success: 0,
    failed: 0,
    details: [] as any[]
  };

  const studentIds: string[] = [];

  for (const line of dataLines) {
    const parts = parseCSVLine(line);
    if (parts.length < 6) continue;

    const [apellido, nombre, dni, fechaNac, contacto, email] = parts;
    
    // Parse Date: 14/9/1983 -> 1983-09-14 12:00:00.000Z
    let birthDateObj = null;
    if (fechaNac) {
      const [day, month, year] = fechaNac.split('/');
      if (day && month && year) {
        birthDateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
      }
    }

    try {
      // 1. Check if user already exists by email or DNI
      let existingUser = null;
      try {
        existingUser = await pb.collection('users').getFirstListItem(`email="${email}" || dni="${dni}"`);
      } catch (e) {
        // Not found, which is fine
      }

      let studentId;

      if (existingUser) {
        studentId = existingUser.id;
        results.details.push({ email, status: 'User already exists', id: studentId });
      } else {
        // Create new user
        const newUser = await pb.collection('users').create({
          username: `user_${dni}`,
          email: email,
          emailVisibility: true,
          password: dni, // Using DNI as default password
          passwordConfirm: dni,
          name: `${nombre} ${apellido}`,
          firstName: nombre,
          lastName: apellido,
          dni: dni,
          phone: contacto,
          birthDate: birthDateObj ? birthDateObj.toISOString() : null,
          role: 'estudiante'
        });
        studentId = newUser.id;
        results.details.push({ email, status: 'User created', id: studentId });
      }

      studentIds.push(studentId);
      results.success++;

    } catch (err: any) {
      console.error(`Error processing ${email}:`, err.message);
      results.details.push({ email, status: 'Error', error: err.message });
      results.failed++;
    }
  }

  // Now add all these students to the course
  try {
    const course = await pb.collection('courses').getOne(courseId);
    const currentStudents = course.students || [];
    
    // Merge without duplicates
    const newStudents = Array.from(new Set([...currentStudents, ...studentIds]));
    
    await pb.collection('courses').update(courseId, {
      students: newStudents
    });
    
    results.details.push({ status: 'Course updated', newStudentsCount: newStudents.length });
  } catch (err: any) {
    console.error('Error updating course:', err.message);
    results.details.push({ status: 'Course update error', error: err.message });
  }

  return NextResponse.json(results);
}