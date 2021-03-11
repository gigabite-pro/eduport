const localStorage = require('localStorage')
const jwt = require('jsonwebtoken')

module.exports = {
    authenticateJWT:  function (req, res, next) {
        const token = localStorage.getItem('jwtToken');
    
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }
    
                req.user = user;
                next();
            });
        } else {
            res.redirect('/login')
        }
    }
}