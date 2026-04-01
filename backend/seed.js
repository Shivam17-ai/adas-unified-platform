const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const AdasData = require('./models/AdasData');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/adas_db';
const CSV_FILE_PATH = './ADAS FINAL ANALYSIS LAST (1).csv'; // Make sure your dataset is named exactly this

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB. Starting data seed...');
    return AdasData.deleteMany({}); // Clear existing data to avoid duplicates
  })
  .then(() => {
    const results = [];
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await AdasData.insertMany(results);
          console.log(`✅ Successfully inserted ${results.length} historical records!`);
          process.exit();
        } catch (error) {
          console.error('❌ Error inserting data:', error);
          process.exit(1);
        }
      });
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });