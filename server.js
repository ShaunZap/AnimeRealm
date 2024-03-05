const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const mongooseUsername = process.env.MONGOOSE_USER;
const mongoosePassword = process.env.MONGOOSE_PASSWORD;
const key = process.env.SECRET_KEY;

mongoose.connect(`mongodb+srv://${mongooseUsername}:${mongoosePassword}@cluster0.osi99c1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express route to handle user registration
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Express route to handle user authentication
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.sendStatus(401); // Unauthorized
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ username: username }, key, { expiresIn: '1h' });
            res.status(200).json(token);
        } else {
            res.sendStatus(401); // Unauthorized
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/pages/registration.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'registration.html'));
});
app.get('/pages/anime.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'anime.html'));
});
app.get('/pages/manga.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'manga.html'));
});
app.get('/pages/animeNav.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'animeNav.html'));
});
app.get('/pages/mangaNav.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'mangaNav.html'));
});
app.get('/pages/BrowseAnime.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'BrowseAnime.html'));
});
app.get('/pages/BrowseManga.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'BrowseManga.html'));
});
app.get('/pages/mangaInfo.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'mangaInfo.html'));
});
app.get('/pages/animeInfo.html', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages', 'animeInfo.html'));
});
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('No token provided.');

    jwt.verify(token.split(' ')[1], key, (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.');

        req.username = decoded.username;
        next();
    });
};

// Protected route
app.get('/protected', verifyToken, (req, res) => {
    res.send('You are authenticated.');
});
