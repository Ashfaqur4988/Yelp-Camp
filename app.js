if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}

// console.log(process.env);

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review");
const session = require('express-session');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local');
const helmet = require("helmet");
const MongoDBStore = require('connect-mongo');

const passport = require("passport");
const User = require('./models/user')

const usersRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews.js');

//mongo sanitize
const mongoSanitize = require('express-mongo-sanitize');
// local host = "mongodb://localhost:27017/yelp-camp"

const dbUrl = process.env.DB_PWD || "mongodb://localhost:27017/yelp-camp";

mongoose
    .connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connection OPEN!!");
    })
    .catch((err) => {
        console.log("ERROR", err);
    });

const app = express();

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];

//configuring the CSP
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcznfwrnp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || "thisisasecret";

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //in seconds
});

store.on('error', function (e) {
    console.log("session error ", e);
});

//configuring  the session
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//sanitize mongo
app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//flash middleware
app.use((req, res, next) => {
    

    //added for return to the original url
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    //till here
    res.locals.currentUser = req.user; //added to save the current user in this variable
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//routes prefixes
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes)

app.get("/", (req, res) => {
    res.render("home");
});




app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(status).render("error", { err });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("serving on port 3000");
});
