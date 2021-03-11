const mongoose = require('mongoose');

const ClassSchema = mongoose.Schema({
    ownerName: {
        type: String,
        required: true
    },
    ownerEmail: {
        type: String,
        required: true
    },
    inviteCode: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    members: {
        type: Array, // [{"name":"", "email": "", "parentEmail": "", "pfp": "", "status": "approved/pending"},....]
        required: false
    },
    notices: {
      type: Array, // [{"title":"", "content": "", "publishedOn": ""},...]  
      required: false
    },
    schedule: {
        type: Array, // [{"className":"", "classDescription": "", "scheduledFor": ""},...]
        required: false
    },
    homework: {
        type: Array, 
        required: false
    },
    reports: {
        type: Array, // [{"reportName", "", "reportDescription": "", "marks": ""},...]
        required: false
    },
    tests: {
        type: Array, // [{"testName", "", "testDescription": "", "testDate": "", "fileLink": "", "questions": ["2+2?","2+3?",...]},...]
        required: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const Class = mongoose.model('Class', ClassSchema);

module.exports = Class;