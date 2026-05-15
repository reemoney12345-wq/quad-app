import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@quad.app' },
    update: {},
    create: {
      email: 'demo@quad.app',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  // Create locations (UNILAG)
  const locations = [
    { name: 'UNILAG Main Library', category: 'Study', walkMinutes: 4, description: 'Main library — 4 floors, silent zones on 3rd & 4th.', latitude: 6.5173, longitude: 3.3861 },
    { name: 'UNILAG Medical Centre', category: 'Health', walkMinutes: 6, description: 'Campus health centre. Walk-ins until 5pm.', latitude: 6.5187, longitude: 3.3924 },
    { name: 'Main Auditorium', category: 'Academic', walkMinutes: 3, description: '300-seat hall, near the main quad.', latitude: 6.5165, longitude: 3.3892 },
    { name: 'New Cafeteria', category: 'Food', walkMinutes: 5, description: 'Open 7am–9pm. Hot meals until 8.', latitude: 6.5190, longitude: 3.3878 },
    { name: 'Mariere Hostel', category: 'Residence', walkMinutes: 9, description: 'Residential block, west wing.', latitude: 6.5148, longitude: 3.3850 },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { id: loc.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: loc.name.toLowerCase().replace(/\s+/g, '-'), ...loc },
    });
  }

  // Create rooms
  const rooms = [
    { name: 'Room 201', building: 'Block A', capacity: 30, status: 'until', until: '3:30 PM' },
    { name: 'Seminar 4', building: 'Block A', capacity: 15, status: 'available', until: null },
    { name: 'Hall B2', building: 'Block B', capacity: 120, status: 'occupied', until: null },
    { name: 'Studio 1', building: 'Arts Wing', capacity: 25, status: 'available', until: null },
    { name: 'Lab 3', building: 'Science Block', capacity: 40, status: 'until', until: '4:15 PM' },
    { name: 'Room 108', building: 'Block B', capacity: 50, status: 'occupied', until: null },
    { name: 'Tutorial 7', building: 'Block A', capacity: 20, status: 'available', until: null },
    { name: 'Lecture Hall C', building: 'Science Block', capacity: 200, status: 'until', until: '5:00 PM' },
    { name: 'Studio 2', building: 'Arts Wing', capacity: 25, status: 'available', until: null },
  ];

  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  // Create sample updates
  const updates = [
    { userId: user.id, category: 'Crowd', location: 'Library', message: 'Library is full — no seats on 2nd floor.', confirmations: 8 },
    { userId: user.id, category: 'WiFi', location: 'Block B', message: 'WiFi keeps dropping in Block B.', confirmations: 5 },
    { userId: user.id, category: 'Queue', location: 'Clinic', message: 'Clinic queue is short right now — good time to go.', confirmations: 11 },
    { userId: user.id, category: 'Crowd', location: 'Cafeteria', message: 'Cafeteria crowded, ~15 min wait for hot meals.', confirmations: 3 },
  ];

  for (const update of updates) {
    await prisma.campusUpdate.create({ data: update });
  }

  // Create sample lost & found items
  const items = [
    { userId: user.id, type: 'lost', name: 'Student ID Card', location: 'Library, 3rd floor', date: 'Today', reporter: 'Ada O.', note: 'Name: A. Okafor' },
    { userId: user.id, type: 'lost', name: 'Bunch of keys', location: 'Cafeteria', date: 'Yesterday', reporter: 'Tomi K.', note: 'Blue lanyard' },
    { userId: user.id, type: 'lost', name: 'Black backpack', location: 'Lecture Hall A', date: '2 days ago', reporter: 'Zara M.' },
    { userId: user.id, type: 'lost', name: 'Water bottle', location: 'Hostel C lobby', date: 'Today', reporter: 'Ife A.', note: 'Green metal' },
    { userId: user.id, type: 'found', name: 'AirPods (case)', location: 'Library', date: 'Today', reporter: 'Front desk' },
    { userId: user.id, type: 'found', name: 'Phone — black', location: 'Cafeteria table 4', date: 'Today', reporter: 'Sade B.' },
    { userId: user.id, type: 'found', name: 'Brown wallet', location: 'Block A corridor', date: 'Yesterday', reporter: 'Security' },
    { userId: user.id, type: 'found', name: 'Spiral notebook', location: 'Lecture Hall A', date: '2 days ago', reporter: 'Mr. Eze' },
  ];

  for (const item of items) {
    await prisma.lostFoundItem.create({ data: item });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });