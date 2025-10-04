/*
  Mongoose connection helper.
  Use MongoDB for flexible data: product reviews, activity logs, analytics events.
*/

const mongoose = require('mongoose');

async function initMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/betta_shop';
  await mongoose.connect(uri, { dbName: 'betta_shop' });
  console.log('Connected to MongoDB');
}

module.exports = { initMongo, mongoose };
