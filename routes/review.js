const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressErr = require("../utils/ExpressErr.js");
const { reviewSchema } = require('../schema.js');
const { isLoggedIn } = require('../middleWare.js');
const { isOwnerOfReview } = require('../middleWare.js');

const reviewController = require('../controller/review.js');

// Validation Middleware

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        // Show readable Joi error
        throw new ExpressErr(400, error.details[0].message);
    } else {
        next();
    }
};

// Add Review
router.post("/", validateReview, isLoggedIn, wrapAsync(reviewController.addReview));


// Delete Review
router.delete("/:reviewId", isLoggedIn, isOwnerOfReview, wrapAsync(reviewController.deleteReview));

module.exports = router;