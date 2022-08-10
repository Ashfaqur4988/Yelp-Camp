const Campground = require("../models/campground");
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.newForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampgrounds = async (req, res, next) => {

    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //map over to get the image and filename
    campground.author = req.user._id; //to associate the current user as author
    await campground.save();
    // console.log(campground);
    req.flash("success", "Successfully added campground");
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.showCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id).populate({
        path: "reviews",
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campgrounds);
    if (!campgrounds) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campgrounds });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampgrounds = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); //saving in a variable
    campground.images.push(...imgs); // pushing new images to the array
    await campground.save();
    //added for deleting from mongo and cloudinary
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){ //added for cloudinary deletion
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }); //added for mongo deletion
        // console.log(campground);
    }
    //ended delete code

    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampgrounds = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}