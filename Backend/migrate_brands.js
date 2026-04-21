const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) dotenv.config();

const City = require('./models/City');
const Brand = require('./models/Brand');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const indore = await City.findOne({ name: 'Indore' });
    if (!indore) {
      console.log('Indore city not found');
      process.exit(1);
    }
    console.log(`Target City: ${indore.name} [${indore._id}]`);

    // Find brands to migrate
    const query = {
      $or: [
        { cityIds: { $exists: false } },
        { cityIds: { $size: 0 } },
        { cityIds: null }
      ]
    };

    const brandsCount = await Brand.countDocuments(query);
    console.log(`Found ${brandsCount} global/unassigned brands to migrate.`);

    if (brandsCount === 0) {
      console.log('No brands to migrate.');
      process.exit(0);
    }

    // Perform update
    const result = await Brand.updateMany(query, {
      $set: { cityIds: [indore._id] }
    });

    console.log(`Migration Complete: Modified ${result.modifiedCount} brands.`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

run();
