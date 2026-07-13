const Listing = require('../models/listing');
const ExpressErr = require('../utils/ExpressErr.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// INDEX – Show all listings
module.exports.index = async (req, res) => {
  const alllistings = await Listing.find({});
  res.render('../views/listing/index.ejs', { listing: alllistings });
};

// NEW – Render form to create new listing
module.exports.newListingForm = (req, res) => {
  res.render('../views/listing/new.ejs');
};

// SHOW – Show single listing details
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('owner');

  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listing');
  }

  res.render('../views/listing/show.ejs', { listing });
};

// CREATE – Add new listing
module.exports.newListing = async (req, res, next) => {
  const { listing } = req.body;
  if (!listing) throw new ExpressErr(400, "Invalid listing data!");

  // Get geocode info
  const geoData = await geocodingClient.forwardGeocode({
    query: listing.location,
    limit: 1
  }).send();

  const newListing = new Listing(listing);
  newListing.geometry = geoData.body.features[0].geometry;
  newListing.owner = req.user._id;

  // Handle file upload
  if (req.file) {
    const url = req.file.path || req.file.location || req.file.secure_url || req.file.url;
    const filename = req.file.filename || '';
    newListing.image = { url, filename };
  }

  await newListing.save();
  req.flash('success', 'Listing created successfully!');
  res.redirect(`/listing/${newListing._id}`);
};

// EDIT FORM – Render edit page
module.exports.editListingForm = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listing');
  }

  let originalImageUrl = listing.image?.url;
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace('/upload/', '/upload/h_300,w_300/');
  }

  res.render('../views/listing/edit.ejs', { listing, originalImageUrl });
};

// UPDATE – Handle listing updates
module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  const { listing } = req.body;

  if (!listing) {
    throw new ExpressErr(400, "Invalid listing data!");
  }

  // 1️⃣ Geocode the new location
  const geoData = await geocodingClient.forwardGeocode({
    query: listing.location,
    limit: 1
  }).send();

  // Defensive check
  const geoFeature = geoData.body.features[0];
  if (!geoFeature) {
    req.flash('error', 'Unable to find coordinates for that location.');
    return res.redirect(`/listing/${id}/edit`);
  }

  // 2️⃣ Find the listing manually (not using findByIdAndUpdate)
  const updatedListing = await Listing.findById(id);
  if (!updatedListing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listing');
  }

  // 3️⃣ Update fields manually
  updatedListing.title = listing.title;
  updatedListing.description = listing.description;
  updatedListing.price = listing.price;
  updatedListing.location = listing.location;
  updatedListing.country = listing.country;
  updatedListing.geometry = geoFeature.geometry; // ✅ always update geometry

  // 4️⃣ Update image if uploaded
  if (req.file) {
    const url = req.file.path || req.file.location || req.file.secure_url || req.file.url;
    const filename = req.file.filename || '';
    updatedListing.image = { url, filename };
  }

  // 5️⃣ Save changes
  await updatedListing.save();

  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listing/${id}`);
};


// DELETE – Remove listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Listing deleted successfully!');
  res.redirect('/listing');
};
