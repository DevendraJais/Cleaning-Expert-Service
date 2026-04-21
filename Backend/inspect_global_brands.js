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
    console.log(`Indore ID: ${indore._id}`);

    // Check brands with no city assigned (Global)
    const globalBrandsCount = await Brand.countDocuments({
      $or: [
        { cityIds: { $exists: false } },
        { cityIds: { $size: 0 } },
        { cityIds: null }
      ]
    });

    console.log(`Brands with NO city assigned (Global): ${globalBrandsCount}`);

    // Also list a few titles just to be sure
    if (globalBrandsCount > 0) {
      const examples = await Brand.find({
        $or: [
          { cityIds: { $exists: false } },
          { cityIds: { $size: 0 } },
          { cityIds: null }
        ]
      }).limit(5).select('title');
      console.log('Example Global Brands:', examples.map(b => b.title));
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
