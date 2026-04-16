const PocketBase = require('pocketbase/cjs');

async function main() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  try {
    await pb.admins.authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);

    const collectionData = {
      name: 'account_requests',
      type: 'base',
      system: false,
      schema: [
        {
          name: 'lastName',
          type: 'text',
          required: true,
          options: { min: 1, max: 100 }
        },
        {
          name: 'firstName',
          type: 'text',
          required: true,
          options: { min: 1, max: 100 }
        },
        {
          name: 'dni',
          type: 'text',
          required: true,
          options: { min: 1, max: 20 }
        },
        {
          name: 'googleEmail',
          type: 'email',
          required: true,
          options: { exceptDomains: [], onlyDomains: [] }
        },
        {
          name: 'status',
          type: 'select',
          required: false,
          options: { values: ['pendiente', 'resuelto'], maxSelect: 1 }
        }
      ],
      listRule: '@request.auth.role = "admin" || @request.auth.role = "docente"',
      viewRule: '@request.auth.role = "admin" || @request.auth.role = "docente"',
      createRule: '', // Permite crear a cualquiera sin estar logueado
      updateRule: '@request.auth.role = "admin" || @request.auth.role = "docente"',
      deleteRule: '@request.auth.role = "admin"'
    };

    const collection = await pb.collections.create(collectionData);
    console.log("Collection 'account_requests' created successfully:", collection.id);
  } catch (e) {
    if (e.response && e.response.data && e.response.data.name && e.response.data.name.code === 'validation_invalid_name') {
      console.log("Collection already exists or invalid name.");
    } else {
      console.error("Error creating collection:", e.response || e.message);
    }
  }
}

main();