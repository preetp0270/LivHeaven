const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressErr = require("../utils/ExpressErr.js");
const { listingSchema } = require('../schema.js');
const { isLoggedIn, isOwner } = require('../middleWare.js');
const listingController = require('../controller/listing.js');
const multer  = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// Validation Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body.listing);
    if (error) {
        throw new ExpressErr(400, error.details[0].message);
    } else {
        next();
    }
};

// Routes
router.route('/')
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]') , wrapAsync(listingController.newListing));
router.route('/new')
    .get(isLoggedIn, wrapAsync(listingController.newListingForm));

router.route('/:id')
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

router.route('/:id/edit')
    .get(isLoggedIn, isOwner, wrapAsync(listingController.editListingForm));

module.exports = router;