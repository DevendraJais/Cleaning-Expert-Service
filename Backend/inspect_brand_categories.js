const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) dotenv.config();

const Brand = require('./models/Brand');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const brands = await Brand.find({}).select('title categoryIds categoryId');

    console.log('--- Brand Category Check ---');
    brands.forEach(b => {
      const catIds = b.categoryIds || [];
      const catId = b.categoryId;
      // Only log pertinent ones or a summary if too many
      if (catIds.length === 0 && !catId) {
        console.log(`[WARNING] Brand "${b.title}" has NO categories.`);
      } else {
        // console.log(`Brand "${b.title}" has ${catIds.length} categories.`);
      }
    });

    const noCatCount = await Brand.countDocuments({ $and: [{ categoryIds: { $size: 0 } }, { categoryId: null }] });
    console.log(`Total brands with absolutely no categories: ${noCatCount}`);

    // Check specifically the ones I migrated (LG, Voltas, etc)
    const specificBrands = await Brand.find({ title: { $in: ['LG', 'VOLTAS', 'GODREJ', 'HAIER', 'WHIRLPOOL'] } });
    console.log('--- Migrated Brands Check ---');
    specificBrands.forEach(b => {
      console.log(`Brand: ${b.title}, Status: ${b.status}, CategoryIDs: ${b.categoryIds}, Legacy CategoryId: ${b.categoryId}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
