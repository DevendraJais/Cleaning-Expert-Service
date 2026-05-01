const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function scan() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } });
  console.log('Total users with tokens:', users.length);
  users.forEach(u => {
    console.log(`- ${u.name} (${u._id}): ${u.fcmTokens.length} tokens`);
  });
  process.exit(0);
}
scan();
