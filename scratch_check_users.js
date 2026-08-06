import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import { User } from './backend/src/models/index.js';

async function check() {
  try {
    const users = await User.findAll();
    console.log('USERS IN DB:');
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Mobile: ${u.mobile}, MemberID: ${u.memberId}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

check();
