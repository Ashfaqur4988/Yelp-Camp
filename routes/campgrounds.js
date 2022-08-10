const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const {storage} = require('../cloudinary/index');
const multer = require('multer');

const upload = multer({storage});

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampgrounds)); //upload added for img upload

router.get("/new", isLoggedIn, catchAsync(campgrounds.newForm));

router.route("/:id")
    .get(catchAsync(campgrounds.showCampgrounds))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds));


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;
