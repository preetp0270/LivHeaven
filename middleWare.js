const Listing = require('./models/listing');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Save where the user was trying to go
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listing/${id}`);
    }
    next();
};

module.exports.isOwnerOfReview = async (req, res, next) => {
  const { reviewId, id } = req.params;

  // Fetch the review directly from DB
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash('error', 'Review not found!');
    return res.redirect(`/listing/${id}`);
  }

  // Check if current user is the author
  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/listing/${id}`);
  }

  next();
};