const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) dotenv.config();

const Category = require('./models/Category');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const categories = await Category.find({}).select('title _id');
    console.log(`Found ${categories.length} categories.`);

    categories.forEach(c => {
      console.log(`${c.title} -> ${c._id}`);
    });

    const targetCatId = '69451ec71737849f5695624f';
    const found = categories.find(c => c._id.toString() === targetCatId);
    if (found) {
      console.log(`\nMatch Found for GODREJ cat: ${found.title}`);
    } else {
      console.log(`\nNO Match Found for GODREJ cat ID: ${targetCatId}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
