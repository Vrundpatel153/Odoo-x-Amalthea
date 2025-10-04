import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import Company from '../models/Company';
import User from '../models/User';

async function run() {
  await connectDB();
  const company = await Company.create({ name: 'Demo Corp', adminEmail: 'admin@demo.test' });
  const admin = await User.create({
    company: company._id,
    name: 'Admin',
    email: 'admin@demo.test',
    password: await bcrypt.hash('password', 10),
    role: 'admin',
  });
  const manager = await User.create({
    company: company._id,
    name: 'Manager',
    email: 'manager@demo.test',
    password: await bcrypt.hash('password', 10),
    role: 'manager',
  });
  console.log('Seeded:', { company: company.id, admin: admin.id, manager: manager.id });
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
