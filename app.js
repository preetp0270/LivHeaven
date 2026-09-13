// ============================================================
// Environment
// ============================================================

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


// ============================================================
// Imports
// ============================================================

const express = require("express");
const app = express();

const dns = require("dns");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressErr = require("./utils/ExpressErr.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const reviewRoutes = require("./routes/review.js");
const listingsRoutes = require("./routes/listing.js");
const userRoutes = require("./routes/user.js");


// ============================================================
// App Configuration
// ============================================================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);


// ============================================================
// Render Configuration
// ============================================================

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}


// ============================================================
// General Middleware
// ============================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    methodOverride("_method")
);


// ============================================================
// DNS Configuration
// ============================================================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);


// ============================================================
// Passport Configuration
// ============================================================

passport.use(
    new LocalStrategy(
        User.authenticate()
    )
);

passport.serializeUser(
    User.serializeUser()
);

passport.deserializeUser(
    User.deserializeUser()
);


// ============================================================
// Server Startup
// ============================================================

async function startServer() {

    try {
        const atlasDbName = (
            process.env.ATLAS_DB_NAME || "LivHeaven"
        ).trim();

        // ----------------------------------------------------
        // Check Environment Variables
        // ----------------------------------------------------

        if (!process.env.ATLAS_DB_USER) {
            throw new Error(
                "ATLAS_DB_USER environment variable is missing."
            );
        }

        if (!process.env.SESSION_SECRET) {
            throw new Error(
                "SESSION_SECRET environment variable is missing."
            );
        }


        // ----------------------------------------------------
        // MongoDB Connection
        // ----------------------------------------------------

        await mongoose.connect(
            process.env.ATLAS_DB_USER,
            {
                dbName: atlasDbName
            }
        );

        console.log(
            "✅ Connected to MongoDB"
        );


        // ----------------------------------------------------
        // MongoDB Session Store
        // ----------------------------------------------------

        const store = MongoStore.create({
            mongoUrl: process.env.ATLAS_DB_USER,
            mongoOptions: {
                dbName: atlasDbName
            },
            touchAfter: 24 * 3600
        });


        store.on(
            "error",
            function (error) {

                console.error(
                    "❌ SESSION STORE ERROR:",
                    error
                );

            }
        );


        // ----------------------------------------------------
        // Session Configuration
        // ----------------------------------------------------

        const sessionOptions = {

            store: store,

            secret: process.env.SESSION_SECRET,

            resave: false,

            saveUninitialized: false,

            cookie: {

                expires: new Date(
                    Date.now() +
                    1000 * 60 * 60 * 24 * 7
                ),

                maxAge:
                    1000 *
                    60 *
                    60 *
                    24 *
                    7,

                httpOnly: true,

                secure:
                    process.env.NODE_ENV === "production",

                sameSite: "lax"

            }

        };


        // ----------------------------------------------------
        // Session
        // ----------------------------------------------------

        app.use(
            session(sessionOptions)
        );


        // ----------------------------------------------------
        // Flash
        // ----------------------------------------------------

        app.use(
            flash()
        );


        // ----------------------------------------------------
        // Passport
        // ----------------------------------------------------

        app.use(
            passport.initialize()
        );

        app.use(
            passport.session()
        );


        // ----------------------------------------------------
        // Global Variables
        // ----------------------------------------------------

        app.use(
            function (req, res, next) {

                res.locals.success =
                    req.flash("success");

                res.locals.error =
                    req.flash("error");

                res.locals.currentUser =
                    req.user;

                next();

            }
        );


        // ====================================================
        // Routes
        // ====================================================

        // Home
        app.get(
            "/",
            function (req, res) {

                res.send(
                    "Hello! This Is Root!"
                );

            }
        );


        // Listings
        app.use(
            "/listing",
            listingsRoutes
        );


        // Reviews
        app.use(
            "/listing/:id/reviews",
            reviewRoutes
        );


        // Users / Authentication
        app.use(
            "/",
            userRoutes
        );


        // ====================================================
        // 404 Handler
        // ====================================================

        app.use(
            function (req, res, next) {

                next(
                    new ExpressErr(
                        404,
                        "Page Not Found! :)"
                    )
                );

            }
        );


        // ====================================================
        // Error Handler
        // ====================================================

        app.use(
            function (err, req, res, next) {

                console.error(
                    "❌ Error:",
                    err
                );


                // Prevent "Cannot set headers after
                // they are sent to the client"
                if (res.headersSent) {
                    return next(err);
                }


                const status =
                    err.status || 500;

                const message =
                    err.message ||
                    "Something went wrong!";


                // Try to render error page
                res.status(status);


                res.render(
                    "error.ejs",
                    {
                        status: status,
                        message: message
                    },
                    function (renderError, html) {

                        if (renderError) {

                            console.error(
                                "❌ Could not render error.ejs:",
                                renderError
                            );

                            return res.send(
                                status +
                                " - " +
                                message
                            );

                        }

                        return res.send(html);

                    }
                );

            }
        );


        // ====================================================
        // Start HTTP Server
        // ====================================================

        const port =
            process.env.PORT || 3000;


        app.listen(
            port,
            "0.0.0.0",
            function () {

                console.log(
                    "🚀 Server running on port " +
                    port
                );

            }
        );


    } catch (error) {

        // ====================================================
        // Startup Error
        // ====================================================

        console.error(
            "❌ Application startup failed:"
        );

        console.error(
            error
        );

        process.exit(1);

    }

}


// ============================================================
// Start Application
// ============================================================

startServer();
