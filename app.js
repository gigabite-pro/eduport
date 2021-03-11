const express = require('express');
const app = express();
const mongoose = require('mongoose');
const db = require('./config/keys').MongoURI;
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();

//Express Session 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

//Connect Flash
app.use(flash());

//Global Vars
app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

//Body Parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Db connect
mongoose.connect(db, {useNewUrlParser: true,useUnifiedTopology: true})
.then(() => console.log('MongoDB connected.'))
.catch(err => console.log(err))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/class', require('./routes/class'))

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`))