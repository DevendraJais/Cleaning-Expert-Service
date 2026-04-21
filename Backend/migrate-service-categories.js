const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const connectDB = require('./config/db');

dotenv.config();

async function migrate() {
  try {
    await connectDB();
    console.log('Connected to DB');

    const services = await Service.find({ categoryIds: { $size: 0 } });
    console.log(`Found ${services.length} services to migrate`);

    for (const service of services) {
      if (service.categoryId) {
        service.categoryIds = [service.categoryId];
        await service.save();
        console.log(`Migrated service: ${service.title}`);
      } else {
        console.log(`Service ${service.title} has no categoryId, skipping...`);
      }
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
