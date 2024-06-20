// models/Post.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        data: Buffer,
        contentType: {
            type: String,
            required: true,
        }
    },
    description: {
        type: String,
        required: true,
    }
});

const ImageModel = mongoose.model('ImageModel', postSchema);
module.exports = ImageModel;
