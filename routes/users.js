const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users');


//register route
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))


//login route
router.route('/login')
    .get((req, res) => {
        res.render('users/login')
    })
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);


//logout route
router.get('/logout', users.logout);


module.exports = router;