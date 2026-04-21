// Vercel Serverless Function Entry Point
// This file wraps the Express app for Vercel's serverless environment

const app = require('../server');

// Export the app for Vercel
module.exports = app;

