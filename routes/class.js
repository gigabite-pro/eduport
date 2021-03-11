const express = require('express')
const router = express.Router()
const { authenticateJWT } = require('../config/authenticateJWT')
const User = require('../models/User')
const Class = require('../models/Class')

router.post('/create', authenticateJWT, (req, res) => {
    const { name, about } = req.body

    User.findOne({email: req.user.email}, (err, user) => {
        if(err) {
            res.status(500)
        }
        const newClass = new Class({
            name,
            about,
            ownerName: user.name,
            ownerEmail: user.email,
            inviteCode: Math.floor(100000 + Math.random() * 900000)
        });

        if(user.typeOfUser == 'teacher') {
            newClass.save()
            user.classes = [...user.classes, {"name": name, "about": about, "inviteCode": newClass.inviteCode}]
            user.save()
        }

        res.redirect('/dashboard')
    })
})

router.post('/join', authenticateJWT, (req, res) => {
    const { inviteCode } = req.body

    User.findOne({email: req.user.email}, (err, user) => {
        if(err) {
            res.status(500)
        }

        Class.findOne({inviteCode: inviteCode}, (err, classFound) => {
            if(err) {
                res.status(500)
            }
            
            classFound.members = [...classFound.members, {"name": user.name, "email": user.email, "parentEmail": "", "pfp": user.pfp, "status": "pending"}]
            classFound.save()
            user.classes = [...user.classes, {"name": classFound.name, "about": classFound.about, "status": "pending",  "inviteCode": classFound.inviteCode}]
            user.save()
        })

        res.redirect('/dashboard')
    })
})

router.get('/:inviteCode', authenticateJWT, (req,res) => {
    const inviteCode = req.params.inviteCode
    Class.findOne({inviteCode: inviteCode}, async (err, classFound) => {
        if(err) {
            res.status(500)
        }

        const members = classFound.members
        const ownerEmail = classFound.ownerEmail
        const user = await User.findOne({ email: req.user.email }).lean()
        const name = classFound.name
        const about = classFound.about
        const ownerName = classFound.ownerName
        const modalMembers = []
        for(let i = 0; i < members.length; i++) {
            let updatedMember = members[i]
            updatedMember.modalID = members[i].email.split('@')[0]
            modalMembers.push(updatedMember)
        }
        const notices = classFound.notices
        const modalNotices = []
        function makeid(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
               result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        for(let i = 0; i < notices.length; i++) {
            let updatedNotice = notices[i]
            updatedNotice.modalID = makeid(6);
            modalNotices.push(updatedNotice)
        }

        const homework = classFound.homework
        const modalHomeworks = []
        for(let i = 0; i < homework.length; i++) {
            let updatedHomework = homework[i]
            updatedHomework.modalID = makeid(6)
            modalHomeworks.push(updatedHomework)
        }

        const schedule = classFound.schedule
        const modalSchedules = []
        for(let i = 0; i < schedule.length; i++) {
            let updatedschedule = schedule[i]
            updatedschedule.modalID = makeid(6)
            modalSchedules.push(updatedschedule)
        }

        const inviteCode = classFound.inviteCode
        const reports = classFound.reports
        const studentReports = []
        for(let i = 0; i < reports.length; i++) {
            if(reports[i].memberEmail == user.email) {
                studentReports.push(reports[i])
            }
        }

        const tests = classFound.tests

        if(user.typeOfUser == 'teacher') {
            if(ownerEmail == user.email) {
                res.render('class', {
                    name,
                    about,
                    ownerName,
                    members: modalMembers,
                    admin: true,
                    notices: modalNotices,
                    homework: modalHomeworks,
                    schedule: modalSchedules,
                    tests,
                    reports,
                    inviteCode
                })
            } else {
                res.status(404)
            }
        } else {
            for(let i=0; i < members.length; i++) {
                if(members[i].email == user.email) {
                    if(members[i].status != "pending") {
                        res.render('class', {
                            name,
                            about,
                            ownerName,
                            members: modalMembers,
                            admin: false,
                            notices: modalNotices,
                            homework: modalHomeworks,
                            schedule: modalSchedules,
                            tests,
                            reports: studentReports,
                            inviteCode
                        })
                    } else {
                        let errors = [];
                        errors.push({msg: "Your request has not been approved by the teacher yet"});
                        res.render('dashboard', {
                            'typeOfUser': user.typeOfUser,
                            'pfp': user.pfp,
                            'name': user.name,
                            'classes': user.classes,
                            errors
                        })
                    }
                }
            }
            res.status(404)
        }

    })
})

router.post('/approvemember', authenticateJWT, async (req, res) => {
    const email = req.body.email
    const inviteCode = req.body.inviteCode
    User.updateOne({ email: email, "classes.inviteCode": inviteCode }, { $set: { "classes.$.status": "approved" } }, (err, resp) => { 
        if(err) {
            res.status(500)
        }
        Class.updateOne({ inviteCode: inviteCode, "members.email": email }, { $set: { "members.$.status": "approved" } }, (err, response) => {
            if(err) {
                res.status(500)
            }
            res.redirect(`/class/${inviteCode}`)
        })
    })
})

router.post('/addreport', authenticateJWT, (req, res) => {
    const { reportName, reportDate, reportMarks, member, inviteCode } = req.body
    Class.findOne({ inviteCode }, async (err, classFound) => {
        if(err) {
            res.status(500)
        }
        const user = await User.findOne({ email: member }).lean()
        classFound.reports = [...classFound.reports, {reportName, reportDate, reportMarks, memberEmail: user.email, memberName: user.name}]
        classFound.save()
        res.redirect(`/class/${inviteCode}`)
    })
})

router.post('/publishnotice', authenticateJWT, (req, res) => {
    const { noticeTitle, noticeContent, noticeDate, inviteCode } = req.body
    Class.findOne({ inviteCode }, (err, classFound) => {
        if(err) {
            res.status(500)
        }

        classFound.notices = [...classFound.notices, {noticeTitle, noticeContent, noticeDate}]
        classFound.save()
        res.redirect(`/class/${inviteCode}`)
    })
})

router.post('/publishhw', authenticateJWT, (req, res) => {
    const { homeworkTitle, homeworkContent, homeworkPublishingDate, homeworkDueDate, inviteCode } = req.body
    Class.findOne({ inviteCode }, (err, classFound) => {
        if(err) {
            res.status(500)
        }

        classFound.homework = [...classFound.homework, {homeworkTitle, homeworkContent, homeworkPublishingDate, homeworkDueDate}]
        classFound.save()
        res.redirect(`/class/${inviteCode}`)
    })
})

router.post('/schedule', authenticateJWT, (req, res) => {
    const { scheduleDate, scheduleFrom, scheduleTo, scheduleContent, inviteCode } = req.body
    Class.findOne({ inviteCode }, (err, classFound) => {
        if(err) {
            res.status(500)
        }
        const scheduleTime = scheduleFrom + ' - ' + scheduleTo 
        classFound.schedule = [...classFound.schedule, {scheduleDate, scheduleTime, scheduleContent}]
        classFound.save()
        res.redirect(`/class/${inviteCode}`)
    })
})

router.post('/publishTest', authenticateJWT, (req,res) => {
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const { testName, testTime, testDate, pdfUrl ,inviteCode } = req.body
    var testCode = makeid(6);
    Class.findOne({ inviteCode }, (err, classFound) => {
        if(err) {
            res.status(500)
        } 
        classFound.tests = [...classFound.tests, {testCode, testName , testTime, testDate , pdfUrl}]
        classFound.save()
        res.redirect(`/class/${inviteCode}`)
    })
})

router.get('/:inviteCode/tests/:testCode', authenticateJWT, (req, res) => {
    const { inviteCode, testCode } = req.params
    Class.findOne({ inviteCode }, async (err, classFound) => {
        if(err) {
            res.status(500)
        }
        const user = await User.findOne({ email: req.user.email }).lean()
        const tests = classFound.tests
        for(let i=0; i<tests.length; i++) {
            if(tests[i].testCode == testCode) {
                res.render('test', {
                    className: classFound.name,
                    name: user.name,
                    testName: tests[i].testName, 
                    testDate: tests[i].testDate,
                    testpdfUrl: tests[i].pdfUrl,
                    testTime: tests[i].testTime
                })
            }
        }
    })
})

module.exports = router