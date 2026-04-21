const cloudinary = require('./config/cloudinary');

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary configuration...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    const result = await cloudinary.api.ping();
    console.log('Cloudinary Ping Result:', result);
    console.log('✅ Cloudinary is configured correctly!');
  } catch (error) {
    console.error('❌ Cloudinary Configuration Error:', error);
  }
}

testCloudinary();
