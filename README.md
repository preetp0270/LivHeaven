LivHeaven

LivHeaven is a full-stack web application for discovering, listing, and reviewing vacation rentals and unique stays. Inspired by platforms like Airbnb, it lets users browse properties by category, view them on an interactive map, create and manage their own listings, upload images, and leave ratings & reviews.



About the Project

LivHeaven is a complete property-listing platform built with the MEN stack (MongoDB, Express, Node.js) and server-side rendered views using EJS.

Key Features





Browse Listings – Explore stays filtered by categories such as Beach, Mountain, Rooms, Camping, Resort, Forest, and more



Interactive Maps – Each listing is geocoded with Mapbox and displayed on a map



User Authentication – Secure signup / login using Passport.js (local strategy) with session persistence



Create & Manage Listings – Authenticated users can add new properties, edit or delete only the ones they own



Image Uploads – Listing photos are stored in the cloud via Cloudinary



Reviews & Ratings – Leave star ratings (1–5) and comments; only the review author can delete their review



Flash Messages – Success and error notifications for a smooth user experience



Responsive UI – Clean, modern interface with category filter bar and price toggle



Authorization Guards – Middleware protects routes so only owners can edit/delete listings and only authors can remove reviews



Tech Stack







Layer



Technology





Runtime



Node.js





Framework



Express.js





Database



MongoDB (MongoDB Atlas) + Mongoose





Templating



EJS + ejs-mate





Authentication



Passport.js + passport-local-mongoose





Sessions



express-session + connect-mongo





Image Storage



Cloudinary + multer-storage-cloudinary





Maps & Geocoding



Mapbox GL JS + @mapbox/mapbox-sdk





Validation



Joi





Other



method-override, connect-flash, dotenv



Project Structure

LivHeaven/
├── app.js                 # Main application entry point
├── cloudConfig.js         # Cloudinary configuration
├── middleWare.js          # Auth & ownership middleware
├── schema.js              # Joi validation schemas
├── package.json
├── controller/            # Route handlers (business logic)
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── models/                # Mongoose models
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── routes/                # Express routers
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── views/                 # EJS templates
│   ├── layouts/
│   ├── includes/
│   ├── listing/
│   └── user/
├── public/                # Static assets (CSS, JS)
│   ├── css/
│   └── JavaScript/
├── init/                  # Seed data & DB initialization
│   ├── data.js
│   └── index.js
└── utils/                 # Helpers
    ├── ExpressErr.js
    └── wrapAsync.js



Getting Started

Prerequisites





Node.js (v18+ recommended; project targets 22.x)



MongoDB Atlas account (or local MongoDB)



Cloudinary account



Mapbox account (access token)

Installation





Clone the repository

git clone <your-repo-url>
cd LivHeaven



Install dependencies

npm install



Create a .env file in the root directory with the following variables:

ATLAS_DB_USER=your_mongodb_connection_string
SESSION_SECRET=a_long_random_secret_string
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_mapbox_access_token
NODE_ENV=development



(Optional) Seed sample listings

node init/index.js



Start the server

node app.js

The app will start on the default port (usually 3000 or as configured). Visit http://localhost:3000/listing to browse listings.



Main Routes







Method



Path



Description



Auth Required





GET



/listing



Show all listings



No





GET



/listing/new



Form to create a new listing



Yes





POST



/listing



Create a new listing



Yes





GET



/listing/:id



Show single listing details + map



No





GET



/listing/:id/edit



Edit form



Yes (Owner)





PUT



/listing/:id



Update listing



Yes (Owner)





DELETE



/listing/:id



Delete listing



Yes (Owner)





POST



/listing/:id/reviews



Add a review



Yes





DELETE



/listing/:id/reviews/:reviewId



Delete a review



Yes (Author)





GET



/signup / /login



User registration & login



No





POST



/signup / /login



Handle signup / login



No





POST



/logout



Log out



Yes



Features in Detail

Listings

Each listing stores title, description, price, location, country, image (Cloudinary URL + filename), owner reference, geometry (GeoJSON Point for maps), category, and an array of reviews.

Categories

Supported categories include:
Trending, Rooms, Beach, Mountain, Resort, Forest, Peace-City, World Icon, Camping, Relex, Archway, Ice-Hills

Security & Middleware





isLoggedIn – Redirects unauthenticated users to login



isOwner – Ensures only the listing owner can edit/delete



isOwnerOfReview – Ensures only the review author can delete a review



Joi schemas validate incoming listing and review data



Sessions stored in MongoDB for production readiness



Environment Variables Summary







Variable



Purpose





ATLAS_DB_USER



MongoDB connection string





SESSION_SECRET



Secret for signing session cookies





CLOUD_NAME



Cloudinary cloud name





CLOUD_API_KEY



Cloudinary API key





CLOUD_API_SECRET



Cloudinary API secret





MAP_TOKEN



Mapbox access token





NODE_ENV



development or production



Future Improvements (Ideas)





Search by location / price range



Booking / availability calendar



User profile pages



Image galleries (multiple photos per listing)



Pagination and infinite scroll



Email notifications



Deployment-ready scripts (e.g., Procfile, start script)



License

This project is licensed under the ISC License.



Built with ❤️ as a full-stack learning project.
Happy exploring with LivHeaven!