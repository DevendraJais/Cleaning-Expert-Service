const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) dotenv.config();

const Brand = require('./models/Brand');
const Category = require('./models/Category'); // Must register model for populate

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);

    // Mimic controller logic
    const query = { title: 'GODREJ' }; // Just check one

    const brands = await Brand.find(query)
      .populate('categoryIds', 'title slug')
      .select('-__v')
      .lean();

    const brand = brands[0];
    console.log('Brand:', brand.title);
    console.log('Raw CategoryIds:', brand.categoryIds);

    const mappedIds = (brand.categoryIds || []).map(cat => {
      if (cat && cat._id) return cat._id.toString();
      if (cat) return cat.toString();
      return 'NULL';
    });

    console.log('Mapped IDs:', mappedIds);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
