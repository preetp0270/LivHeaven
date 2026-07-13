const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require('passport');
const { saveRedirectUrl } = require("../middleWare.js");
const userController = require('../controller/user.js');

// Signup route
router.route('/signup')
.get((req , res) => {
    res.render("user/signup.ejs");
})
.post(wrapAsync(userController.signup));

// Login route
router.route('/login')
.get((req , res) => {
    res.render("user/login.ejs");
})
.post(
    saveRedirectUrl,
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), wrapAsync(userController.login)
);

//logout route
router.get("/logout" , wrapAsync(userController.logout));


module.exports = router;
