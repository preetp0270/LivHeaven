const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

// Listing Schema
const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: {
    url: String,
    filename: String,
  },
  price: { type: Number },
  location: { type: String },
  country: { type: String },
  createdAt: { type: Date, default: Date.now },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category: {
    type: String,
    enum: [
      "Trending", "Rooms", "Beach", "Mountain", "Resort", "Forest", 
      "Peace-City", "World Icon", "Camping", "Relex", "Archway", "Ice-Hills"
    ]
  }
});

// Delete reviews when listing removed
listingSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews }
    });
  }
});

// Export model
const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
module.exports = Listing;
