require('dotenv').config();

module.exports = {
    MongoURI: `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.qnjtj.mongodb.net/users?retryWrites=true&w=majority`
}