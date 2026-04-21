const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) dotenv.config();

const HomeContent = require('./models/HomeContent');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const homeContent = await HomeContent.findOne({ cityId: null });
    if (!homeContent) {
      console.log('No default home content found.');
      process.exit(0);
    }

    console.log('--- Noteworthy ---');
    (homeContent.noteworthy || []).forEach(n => console.log(`- ${n.title}`));

    console.log('\n--- Booked ---');
    (homeContent.booked || []).forEach(b => console.log(`- ${b.title}`));

    console.log('\n--- Category Sections ---');
    (homeContent.categorySections || []).forEach(s => {
      console.log(`Section: ${s.title}`);
      (s.cards || []).forEach(c => console.log(`  - ${c.title}`));
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
