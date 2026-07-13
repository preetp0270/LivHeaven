if (process.env.NODE_ENV !== "production") {
  require('dotenv').config({ path: '../.env' }); // 👈 load from parent folder
}

const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');
const mongoUrl = process.env.ATLAS_DB_USER;

async function main() {
    console.log('Connecting to MongoDB... ' , mongoUrl);
   await mongoose.connect(mongoUrl);
}

main()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const initDb = async () => {
  try {
    await Listing.deleteMany({});
    console.log('Existing listings cleared.');

    const listingsWithOwner = initdata.data.map((obj) => ({
      ...obj,
      owner: '68f0004aa6b09b9aa890225c',
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log('Sample listings added to database.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initDb();
