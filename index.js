const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const connection = require('./db');
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const bcrypt = require("bcrypt");
const { User } = require("./model/user");
const Joi = require("joi");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const ImageModel = require('./model/post');

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

connection();

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "https://social-media-app-front-end-part.vercel.app"
}));

// Endpoint for file upload
app.post('/upload', upload.single('profilePic'), async (req, res) => {
    try {
        const imagePath = path.join(__dirname, 'uploads', req.file.filename);
        const newImage = new ImageModel({
            name: req.body.name,
            image: {
                data: fs.readFileSync(imagePath),
                contentType: req.file.mimetype
            },
            description: req.body.description
        });

        await newImage.save();
        
        res.status(201).json({
            message: 'Image uploaded successfully',
            newImage: {
                name: newImage.name,
                description: newImage.description,
                image: `data:${newImage.image.contentType};base64,${newImage.image.data.toString('base64')}`
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.get('/', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const size = req.query.size ? parseInt(req.query.size) : 5;

        const skip = (page - 1) * size;
        const total = await ImageModel.countDocuments();
        
        const images = await ImageModel.find().skip(skip).limit(size);
        const formattedImages = images.map(image => ({
            _id: image._id, // Ensure _id is included
            name: image.name,
            description: image.description,
            image: `data:${image.image.contentType};base64,${image.image.data.toString('base64')}`
        }));
        
        res.status(200).json({
            formattedImages,
            total,
            page,
            size
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.post("/signup", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) return res.status(409).send({ message: "User with given email already exists" });
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        await new User({ ...req.body, password: hashPassword }).save();
        res.status(201).send({ message: "User created successfully" });
    } catch (err) {
        res.status(500).send({ message: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).send({ message: "Invalid Email or Password" });
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).send({ message: "Invalid Email or Password" });
        const token = user.generateAuthToken();
        user.token = token;
        res.status(200).send({ data: token, message: "Logged in Successfully", user: user });
    } catch (err) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
