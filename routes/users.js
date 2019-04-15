const express = require('express');
const router = express.Router();

// Login Page
router.get('/login', (req, res) => res.render('login'));

// signunp Page
router.get('/signup', (req, res) => res.render('signup'));

// signup handle
router.post('/signup', (req, res) => {
    console.log(req.body)
    res.send('hello');
})

module.exports = router;