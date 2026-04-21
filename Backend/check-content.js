const mongoose = require('mongoose');
const HomeContent = require('./models/HomeContent');
const connectDB = require('./config/db');
require('dotenv').config();

async function checkHomeContent() {
  await connectDB();
  const content = await HomeContent.findOne();
  console.log(JSON.stringify(content, null, 2));
  process.exit();
}

checkHomeContent();
