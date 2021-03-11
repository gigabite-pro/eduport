const express = require('express')
const router = express.Router()
const { authenticateJWT } = require('../config/authenticateJWT')
const localStorage = require('localStorage')
const User = require('../models/User')

//Landing Page
router.get('/', (req,res)=>{
    res.redirect('/login')
})

// Login Page
router.get('/login', (req,res)=>{
    res.render('login')
})

// Register Page
router.get('/register', (req,res)=>{
    res.render('register')
})

//Dashboard Page
router.get('/dashboard', authenticateJWT, (req,res) => {
    User.findOne({email: req.user.email}, (err, user) => {
        if(err) {
            res.sendStatus(401)
        }
        res.render('dashboard', {
            'typeOfUser': user.typeOfUser,
            'pfp': user.pfp,
            'name': user.name,
            'classes': user.classes
        });
    })
})

// Logout
router.get('/logout', (req,res)=>{
    localStorage.removeItem('jwtToken')
    res.redirect('/')
})

module.exports = router