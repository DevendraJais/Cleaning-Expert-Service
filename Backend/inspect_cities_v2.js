const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });
// Also try just .env in case
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

const CitySchema = new mongoose.Schema({
  name: String,
  isDefault: Boolean
});
// Just using minimal schema for quick inspection if needed, but better to require the model file to avoid recompiling if mongoose acts up
// Actually, let's just stick to importing the full model. The previous error was purely connection string related.

const City = require('./models/City');
const Brand = require('./models/Brand');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in env');

    await mongoose.connect(uri);
    console.log('Connected to DB');

    const cities = await City.find({}).select('name isDefault _id');
    console.log('Cities found:');

    const cityMap = {};

    for (const c of cities) {
      console.log(`- ${c.name} (Default: ${c.isDefault}) [ID: ${c._id}]`);
      cityMap[c.name] = c;
      if (c.isDefault) cityMap['Default'] = c;
    }

    const defaultCity = cityMap['Default'];
    const indoreCity = cityMap['Indore'] || cities.find(c => c.name.toLowerCase() === 'indore');

    if (defaultCity) {
      const count = await Brand.countDocuments({ cityIds: defaultCity._id });
      console.log(`Brands explicitly assigned to Default City (${defaultCity.name}): ${count}`);
    } else {
      console.log('No city marked as default found.');
    }

    if (indoreCity) {
      const count = await Brand.countDocuments({ cityIds: indoreCity._id });
      console.log(`Brands in Indore (${indoreCity.name}) currently: ${count}`);
    } else {
      console.log('Indore city not found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
