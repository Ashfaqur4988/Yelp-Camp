const express = require('express');
const path = require('path');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const mongoose = require('mongoose');
const Campground = require("../models/campground");
const axios = require('axios');


mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection OPEN!!");
    })
    .catch((err) => {
        console.log("ERROR", err);
    });

// using axios to fetch data
async function seedImg(){
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
            client_id: 'mjJnCK5yxHINk06b4Tu5gnK983JVTQIHszD6Lpr9fKA',
            collections: 1114848
        }
    })
    return resp.data.urls.small;
    } catch (error) {
        console.log(error);
    }
    
}

const sample = array => array[Math.floor(Math.random() * array.length)]

//delete all the data and check for connection
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        //setup
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50) + 10;
        const camp = new Campground({
            author: '62ed2918be86013af532e66c',
            
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "lorem ipsum dolor st amet consecteur adipisci",
            price: price,
            images: [
                {
                    
                    url: 'https://res.cloudinary.com/dcznfwrnp/image/upload/v1659897465/YelpCamp/ohj7v2eo7hy09xocbtak.png',
                    filename: 'YelpCamp/ohj7v2eo7hy09xocbtak'
                },
                {
                    url: 'https://res.cloudinary.com/dcznfwrnp/image/upload/v1659897465/YelpCamp/yx90i5dvieotukzvabog.png',
                    filename: 'YelpCamp/yx90i5dvieotukzvabog'
                }
            ]
        })
        await camp.save();
    }
}

seedDB();