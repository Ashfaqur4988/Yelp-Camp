const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { reviewSchema } = require("../schemas");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const review = require('../controllers/reviews');


// creating reviews
router.post("/", validateReview, isLoggedIn, catchAsync(review.createReview));

//delete reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview));


module.exports = router;