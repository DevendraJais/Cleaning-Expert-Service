const cloudinary = require('./config/cloudinary');
const streamifier = require('streamifier');

async function testUpload() {
  try {
    console.log('Testing Cloudinary upload...');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'test' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      // Create a tiny dummy buffer (1x1 transparent pixel)
      const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
    console.log('✅ Upload Success:', result.secure_url);
  } catch (error) {
    console.error('❌ Upload Error:', error);
  }
}

testUpload();
