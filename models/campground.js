const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

// https://res.cloudinary.com/demo/image/upload/w_150,h_300,c_fill/boulder.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// virtual is used so that we donot need to store another in db. we can simply look and apply the methods
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new Schema({
    title: String,
    //added for image upload and saving the details
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});


CampgroundSchema.post('findOneAndDelete', async function(doc){
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);