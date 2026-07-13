const User = require('../models/user.js');

module.exports.signup = async (req , res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const newUser = await User.register(user, password);
        // Automatically log in the user after successful registration
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome, ${newUser.username} 😊 to LivHaven!`);
            res.redirect('/listing');
        });
        
    } catch (error) {
        if(error.name === 'UserExistsError'){
            req.flash('error', 'A user with the given email is already registered');
            return res.redirect('/signup');
        }
        else if (error.name === 'ValidationError') {
            req.flash('error', 'Please fill in all fields');
            return res.redirect('/signup');
        }else{
        req.flash('error', 'Something went wrong');
        res.redirect('/signup');
        }
    }

}

module.exports.login = async (req , res) => {
    req.flash('success', `Welcome, back! ${req.user.username} 😊`);
    let redirectUrl = res.locals.redirectUrl;
    res.redirect(redirectUrl || '/listing');
}

module.exports.logout = async (req , res) => {
    // Use callback form to ensure logout completes and to handle errors
    req.logout(function(err) {
        if (err) {
            req.flash('error', 'Failed to log out. Please try again.');
            return res.redirect('/listing');
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/listing');
    });
}