const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const City = require('./models/City');
const Brand = require('./models/Brand');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const cities = await City.find({}).select('name isDefault _id');
    console.log('Cities found:');
    cities.forEach(c => console.log(`${c.name} (Default: ${c.isDefault}) - ID: ${c._id}`));

    // Check brands in default city
    const defaultCity = cities.find(c => c.isDefault);
    if (defaultCity) {
      const brands = await Brand.find({ cityIds: defaultCity._id }).countDocuments();
      console.log(`Brands in default city (${defaultCity.name}): ${brands}`);
    } else {
      // If no default city per se, check for potentially global ones or just list counts per city
      console.log('No specific default city flag true found, checking "Default" name...');
    }

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
