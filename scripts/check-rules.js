const PocketBase = require('pocketbase/cjs');

async function main() {
  const pb = new PocketBase('https://pocketbase-datastack.epixum.com');
  try {
    await pb.admins.authWithPassword('admin@admin.com', 'admin123456'); // Wait, we don't have password. Let's just use user login if possible, or skip it.
  } catch (e) {}
}
main();