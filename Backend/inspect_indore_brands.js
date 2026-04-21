const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) dotenv.config();

const Brand = require('./models/Brand');
const City = require('./models/City');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);

    const indore = await City.findOne({ name: 'Indore' });
    if (!indore) { console.log('Indore missing'); process.exit(0); }

    const brands = await Brand.find({ cityIds: indore._id });
    console.log(`Brands in Indore: ${brands.length}`);

    let emptyCats = 0;
    brands.forEach(b => {
      console.log(`- ${b.title}`);
      if (!b.categoryIds || b.categoryIds.length === 0) {
        emptyCats++;
        console.log(`Brand ${b.title} has NO categories.`);
      }
    });

    console.log(`Brands with empty categoryIds: ${emptyCats}`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
