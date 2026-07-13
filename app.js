if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsmate = require('ejs-mate');
const ExpressErr = require("./utils/ExpressErr.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const reviewRoutes = require('./routes/review.js');
const listingsRoutes = require('./routes/listing.js');
const userRoutes = require('./routes/user.js');

// Middleware Setup
app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// MongoDB Connection
async function main() {
  await mongoose.connect(process.env.ATLAS_DB_USER);
}
main().then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log(err));

// Session Store (reuse existing connection)
const store = MongoStore.create({
  mongoUrl: process.env.ATLAS_DB_USER,
  touchAfter: 24 * 3600,
});

store.on('error', e => console.log('SESSION STORE ERROR', e));

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

// Middleware
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.get('/', (req, res) => res.send('Hello! This Is Root!'));
app.use('/listing', listingsRoutes);
app.use('/listing/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// 404
app.all('/', (req, res, next) => next(new ExpressErr(404, "Page Not Found! :)")));

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.status, err.message);
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  res.status(status);
  try {
    res.render("error.ejs", { status, message });
  } catch {
    res.send(`${status} - ${message}`);
  }
});

// Server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
