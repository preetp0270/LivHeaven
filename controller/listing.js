const Listing = require('../models/listing');
const ExpressErr = require('../utils/ExpressErr.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require('../cloudConfig.js');

// INDEX – Show all listings (optional search by q / country / location / title)
module.exports.index = async (req, res) => {
  const q = (req.query.q || req.query.country || '').trim();
  let filter = {};

  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter = {
      $or: [
        { country: regex },
        { location: regex },
        { title: regex },
        { category: regex }
      ]
    };
  }

  const alllistings = await Listing.find(filter);
  res.render('../views/listing/index.ejs', {
    listing: alllistings,
    searchQuery: q
  });
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

// Helper: resolve image from file upload OR remote URL (prefer Cloudinary)
async function resolveImage(req, listingBody) {
  // 1) File uploaded via multer → Cloudinary storage already set path/filename
  if (req.file) {
    const url = req.file.path || req.file.location || req.file.secure_url || req.file.url;
    const filename = req.file.filename || '';
    return { url, filename };
  }

  // 2) Image URL provided in form
  const imageUrl = (listingBody && listingBody.imageUrl ? String(listingBody.imageUrl) : '').trim();
  if (imageUrl) {
    try {
      // Upload remote URL into Cloudinary so we store a Cloudinary link
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: 'LivHaven_DEV',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']
      });
      return { url: result.secure_url, filename: result.public_id };
    } catch (err) {
      // Fallback: store the raw URL if Cloudinary rejects it
      console.error('Cloudinary remote upload failed, storing raw URL:', err.message);
      return { url: imageUrl, filename: 'external' };
    }
  }

  return null;
}

// CREATE – Add new listing
module.exports.newListing = async (req, res, next) => {
  const { listing } = req.body;
  if (!listing) throw new ExpressErr(400, 'Invalid listing data!');

  const image = await resolveImage(req, listing);
  if (!image || !image.url) {
    throw new ExpressErr(400, 'Please provide an image file or a valid image URL.');
  }

  // Get geocode info
  const geoData = await geocodingClient.forwardGeocode({
    query: `${listing.location}, ${listing.country || ''}`.trim(),
    limit: 1
  }).send();

  if (!geoData.body.features || !geoData.body.features[0]) {
    throw new ExpressErr(400, 'Could not find that location. Try a clearer city or country name.');
  }

  // Strip helper field before creating document
  const { imageUrl, ...listingData } = listing;

  const newListing = new Listing(listingData);
  newListing.geometry = geoData.body.features[0].geometry;
  newListing.owner = req.user._id;
  newListing.image = image;

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
  if (originalImageUrl && originalImageUrl.includes('/upload/')) {
    originalImageUrl = originalImageUrl.replace('/upload/', '/upload/h_300,w_300/');
  }

  res.render('../views/listing/edit.ejs', { listing, originalImageUrl });
};

// UPDATE – Handle listing updates
module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  const { listing } = req.body;

  if (!listing) {
    throw new ExpressErr(400, 'Invalid listing data!');
  }

  const geoData = await geocodingClient.forwardGeocode({
    query: `${listing.location}, ${listing.country || ''}`.trim(),
    limit: 1
  }).send();

  const geoFeature = geoData.body.features && geoData.body.features[0];
  if (!geoFeature) {
    req.flash('error', 'Unable to find coordinates for that location.');
    return res.redirect(`/listing/${id}/edit`);
  }

  const updatedListing = await Listing.findById(id);
  if (!updatedListing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listing');
  }

  updatedListing.title = listing.title;
  updatedListing.description = listing.description;
  updatedListing.price = listing.price;
  updatedListing.location = listing.location;
  updatedListing.country = listing.country;
  if (listing.category) updatedListing.category = listing.category;
  updatedListing.geometry = geoFeature.geometry;

  const image = await resolveImage(req, listing);
  if (image && image.url) {
    updatedListing.image = image;
  }

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
