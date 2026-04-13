const PocketBase = require('pocketbase/cjs');
const readline = require('readline');

const pb = new PocketBase('https://pocketbase-datastack.epixum.com');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('--- Configuración de Colecciones y Cursos en PocketBase ---');
  console.log('URL de PocketBase:', pb.baseUrl);
  
  const email = await question('Email de administrador: ');
  const password = await question('Contraseña de administrador: ');

  try {
    console.log('Autenticando...');
    try {
      await pb.collection('_superusers').authWithPassword(email, password);
    } catch (e) {
      if (e.message.includes('collection')) {
        await pb.admins.authWithPassword(email, password); // fallback for older versions
      } else {
        throw e;
      }
    }
    console.log('✅ Autenticado correctamente.');

    // 1. Crear o actualizar colección enrollment_requests
    console.log('\nVerificando colección enrollment_requests...');
    try {
      await pb.collections.getOne('enrollment_requests');
      console.log('✅ La colección enrollment_requests ya existe.');
    } catch (e) {
      if (e.status === 404) {
        console.log('Creando colección enrollment_requests...');
        await pb.collections.create({
          name: 'enrollment_requests',
          type: 'base',
          schema: [
            { name: 'firstName', type: 'text', required: true, options: { min: 1 } },
            { name: 'lastName', type: 'text', required: true, options: { min: 1 } },
            { name: 'dni', type: 'text', required: true, options: { min: 1 } },
            { name: 'birthDate', type: 'date', required: true },
            { name: 'email', type: 'email', required: true },
            { name: 'phone', type: 'text', required: true, options: { min: 1 } },
            { name: 'courses', type: 'relation', required: true, options: { collectionId: 'courses', cascadeDelete: false, maxSelect: null } },
            { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['pending', 'approved', 'rejected'] } }
          ],
          listRule: '@request.auth.role = "docente" || @request.auth.role = "admin"',
          viewRule: '@request.auth.role = "docente" || @request.auth.role = "admin"',
          createRule: '',
          updateRule: '@request.auth.role = "docente" || @request.auth.role = "admin"',
          deleteRule: '@request.auth.role = "docente" || @request.auth.role = "admin"'
        });
        console.log('✅ Colección enrollment_requests creada.');
      } else {
        throw e;
      }
    }

    // 2. Obtener el ID de la colección courses para asegurar que existe
    console.log('\nVerificando colección courses...');
    let coursesCollection;
    try {
      coursesCollection = await pb.collections.getOne('courses');
      console.log('✅ La colección courses existe.');
      
      // Actualizar listRule si no es público
      if (coursesCollection.listRule !== '') {
        console.log('Actualizando listRule de courses a público...');
        await pb.collections.update('courses', { listRule: '' });
      }
      if (coursesCollection.viewRule !== '') {
        console.log('Actualizando viewRule de courses a público...');
        await pb.collections.update('courses', { viewRule: '' });
      }
    } catch (e) {
      console.error('❌ Error: La colección courses no existe o no se pudo acceder. Debes crearla primero.');
      process.exit(1);
    }

    // 3. Crear cursos si no existen
    console.log('\nVerificando cursos requeridos...');
    const requiredCourses = [
      { title: 'Fundamentos de Docker', status: 'en curso' },
      { title: 'Desarrollo de Aplicaciones Web con IA', status: 'en curso' }
    ];

    for (const course of requiredCourses) {
      const existing = await pb.collection('courses').getList(1, 1, {
        filter: `title = "${course.title}"`
      });

      if (existing.totalItems > 0) {
        console.log(`✅ Curso "${course.title}" ya existe.`);
      } else {
        console.log(`Creando curso "${course.title}"...`);
        await pb.collection('courses').create({
          title: course.title,
          status: course.status
        });
        console.log(`✅ Curso "${course.title}" creado.`);
      }
    }

    console.log('\n🎉 Configuración completada con éxito.');
  } catch (err) {
    console.error('\n❌ Error durante la configuración:', err.message);
    if (err.data) console.error(JSON.stringify(err.data, null, 2));
  } finally {
    rl.close();
  }
}

main();