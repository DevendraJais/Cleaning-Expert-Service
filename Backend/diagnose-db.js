const dotenv = require('dotenv');
dotenv.config();
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log('MONGODB_URI is not defined');
} else {
  try {
    const url = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, 'http://'));
    console.log(`Original Protocol: ${uri.split(':')[0]}`);
    console.log(`Hostname: ${url.hostname}`);
    console.log(`Port: ${url.port}`);
    console.log(`Database: ${url.pathname}`);
  } catch (e) {
    console.log('URI is not a valid URL format for URL parser, might be standard mongo format');
    const match = uri.match(/mongodb:\/\/(.*):(.*)@(.*):(\d+)\/(.*)/) || uri.match(/mongodb:\/\/(.*)\/(.*)/);
    if (match) {
      console.log('Matched standard format');
    } else {
      console.log('Could not parse URI structure');
    }
  }
}
