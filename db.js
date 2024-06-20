const mongoose = require('mongoose')

module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    try {
        mongoose.connect("mongodb://localhost:27017/mern", connectionParams);
        console.log("Connected to database successfully")
    } catch (err) {
        console.log(err);
        console.log("Failed to connect to database");
    }
}