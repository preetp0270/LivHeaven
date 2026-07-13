
const Review = require('../models/review');
const Listing = require('../models/listing');
const ExpressErr = require('../utils/ExpressErr.js');

module.exports.addReview = async (req, res, next) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(new ExpressErr(404, "Listing not found"));
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; 

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash('success', 'Review added successfully!');
    res.redirect(`/listing/${req.params.id}`);
}

module.exports.deleteReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const { id } = req.params;
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        return next(new ExpressErr(404, "Listing not found"));
    }
    listing.reviews.pull(reviewId);
    await Review.findByIdAndDelete(reviewId);
    await listing.save();
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listing/${id}`);
}