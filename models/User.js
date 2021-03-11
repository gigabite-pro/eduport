const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    typeOfUser: {
        type: String,
        required: true
    },
    pfp: {
        type: String,
        required: true
    },
    classes: {
        type: Array,
        required: false,
        default: []
    },
    date : {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;