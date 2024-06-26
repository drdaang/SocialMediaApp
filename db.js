const mongoose = require('mongoose')

module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    try {
        mongoose.connect("mongodb+srv://vercel-admin-user:Abhinav@2021>@cluster0.hcpv2ij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", connectionParams);
        console.log("Connected to database successfully")
    } catch (err) {
        console.log(err);
        console.log("Failed to connect to database");
    }
}
