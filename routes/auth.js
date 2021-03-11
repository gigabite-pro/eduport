const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const localStorage = require('localStorage')

//User Model
const User = require('../models/User')

//Register Handle
router.post('/register', (req,res)=> {
    const {name, email , password , password2, typeOfUser} = req.body;
    let errors = [];
    let pfpList = ["https://cdn.discordapp.com/attachments/751511569971675216/818749306893762570/Untitled-3.png","https://cdn.discordapp.com/attachments/751511569971675216/818749761368752138/Untitled-4.png","https://cdn.discordapp.com/attachments/751511569971675216/818750283445174332/Untitled-5.png","https://cdn.discordapp.com/attachments/751511569971675216/818750816444743750/Untitled-6.png"]

    let pfpIndex = Math.floor(Math.random() * (4 - 0) + 0);
    var pfp = pfpList[pfpIndex];

    //Check required fields
    if(!name || !email || !password || !password2 || !typeOfUser){
        errors.push({msg: 'Please fill in all fields'});
    }

    //Check passwords match
    if(password !== password2){
        errors.push({msg : 'Passwords do not match'})
    }

    //Check pass length
    if(password.length < 6){
        errors.push({msg: 'Password must be atleast 6 characters long'})
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            typeOfUser,
            password,
            password2
        })
    }else{
        //Validation passed
        User.findOne({email: email})
        .then(user => {
            if(user){
                //User exists
                errors.push({msg: 'Email is already Registered'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    typeOfUser,
                    password,
                    password2
                })
            }else{
                const newUser = new User({
                    name,
                    email,
                    password,
                    typeOfUser,
                    pfp
                });

                //Hash Password
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.password, salt, (err,hash)=>{
                        if(err) throw err;
                        //Set password to hash
                        newUser.password = hash;

                        //Save User
                        newUser.save()
                        .then(user => {
                        req.flash('success_msg', 'You are now registered and can log in');
                        res.redirect('/login')
                        })
                        .catch((err)=> console.log(err))
                    })
                })

            }
        })
    }
})

//Login Handle
router.post('/login', async (req,res) => {
    const { email, password } = req.body
    let errors = [];
    if(!email || !password){
        errors.push({msg: 'Please fill in all the fields'})
        return res.render('login', {
            errors,
            email
        })
    }
	const user = await User.findOne({ email }).lean()

	if (!user) {
        errors.push({msg: 'Incorrect email or password'})
		return res.render('login', {
            errors,
            email
        })
	}

	if (await bcrypt.compare(password, user.password)) {

		const token = jwt.sign(
			{
				id: user._id,
				email: user.email
			},
			process.env.JWT_SECRET
		)
        
        localStorage.setItem('jwtToken', token)

		return res.redirect('/dashboard')
	}

    errors.push({msg: 'Incorrect email or password'})
	res.render('login', {
        errors,
        email
    })
})

module.exports = router