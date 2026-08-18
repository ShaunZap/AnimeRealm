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

mongoose.connect(`mongodb+srv://${mongooseUsername}:${mongoosePassword}@cluster0.osi99c1.mongodb.net/?appName=Cluster0`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true }
});

const watchlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kitsuId: { type: String, required: true },
    type: { type: String, enum: ['anime', 'manga'], required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, default: '' }
}, { timestamps: true });

watchlistSchema.index({ user: 1, kitsuId: 1, type: 1 }, { unique: true });

const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kitsuId: { type: String, required: true },
    type: { type: String, enum: ['anime', 'manga'], required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    current: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
}, { timestamps: true });

progressSchema.index({ user: 1, kitsuId: 1, type: 1 }, { unique: true });

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    kitsuId: { type: String, required: true },
    type: { type: String, enum: ['anime', 'manga'], required: true },
    rating: { type: Number, min: 1, max: 10, required: true },
    comment: { type: String, maxlength: 1000, default: '' }
}, { timestamps: true });

reviewSchema.index({ user: 1, kitsuId: 1, type: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const WatchlistItem = mongoose.model('WatchlistItem', watchlistSchema);
const Progress = mongoose.model('Progress', progressSchema);
const Review = mongoose.model('Review', reviewSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getCookie(req, name) {
    const header = req.headers['cookie'];
    if (!header) return null;
    const match = header.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

const verifyToken = (req, res, next) => {
    let token = null;
    const header = req.headers['authorization'];
    if (header) {
        const parts = header.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    if (!token) {
        token = getCookie(req, 'token');
    }

    if (!token) return res.status(401).json({ error: 'No token provided.' });

    jwt.verify(token, key, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Failed to authenticate token.' });
        req.username = decoded.username;
        next();
    });
};

const requireAuthPage = (req, res, next) => {
    let token = getCookie(req, 'token');
    if (!token) return res.redirect('/');
    jwt.verify(token, key, (err) => {
        if (err) return res.redirect('/');
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    try {
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            const msg = existing.username === username ? 'Username already taken.' : 'An account with this email already exists.';
            return res.status(409).json({ error: msg });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.sendStatus(401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ username: user.username }, key, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 3600000 });
            res.status(200).json(token);
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.sendStatus(200);
});

app.get('/api/watchlist', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.username });
        const items = await WatchlistItem.find({ user: user._id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch watchlist.' });
    }
});

app.post('/api/watchlist', verifyToken, async (req, res) => {
    const { id, type, title, thumbnail } = req.body;
    if (!id || !type || !title) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    try {
        const user = await User.findOne({ username: req.username });
        await WatchlistItem.updateOne(
            { user: user._id, kitsuId: id, type },
            { $set: { title, thumbnail } },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update watchlist.' });
    }
});

app.delete('/api/watchlist', verifyToken, async (req, res) => {
    const { id, type } = req.query;
    try {
        const user = await User.findOne({ username: req.username });
        await WatchlistItem.deleteOne({ user: user._id, kitsuId: id, type });
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not remove from watchlist.' });
    }
});

app.get('/api/progress', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.username });
        const items = await Progress.find({ user: user._id }).sort({ updatedAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch progress.' });
    }
});

app.post('/api/progress', verifyToken, async (req, res) => {
    const { id, type, title, thumbnail, current, total } = req.body;
    if (!id || !type || !title) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    try {
        const user = await User.findOne({ username: req.username });
        await Progress.updateOne(
            { user: user._id, kitsuId: id, type },
            { $set: { title, thumbnail, current: Math.max(0, current || 0), total: Math.max(0, total || 0) } },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update progress.' });
    }
});

app.delete('/api/progress', verifyToken, async (req, res) => {
    const { id, type } = req.query;
    try {
        const user = await User.findOne({ username: req.username });
        await Progress.deleteOne({ user: user._id, kitsuId: id, type });
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not remove progress.' });
    }
});

app.get('/api/reviews', async (req, res) => {
    const { id, type } = req.query;
    if (!id || !type) {
        return res.status(400).json({ error: 'Missing title id or type.' });
    }
    try {
        const reviews = await Review.find({ kitsuId: id, type }).sort({ createdAt: -1 }).limit(50);
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch reviews.' });
    }
});

app.post('/api/reviews', verifyToken, async (req, res) => {
    const { id, type, rating, comment } = req.body;
    if (!id || !type || !rating || rating < 1 || rating > 10) {
        return res.status(400).json({ error: 'A rating between 1 and 10 is required.' });
    }
    try {
        const user = await User.findOne({ username: req.username });
        await Review.updateOne(
            { user: user._id, kitsuId: id, type },
            { $set: { username: user.username, rating, comment: comment || '' } },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not save review.' });
    }
});

app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.username });
        const [watchlistCount, progressCount, reviewCount, reviews] = await Promise.all([
            WatchlistItem.countDocuments({ user: user._id }),
            Progress.countDocuments({ user: user._id }),
            Review.countDocuments({ user: user._id }),
            Review.find({ user: user._id }).sort({ createdAt: -1 }).limit(5)
        ]);
        res.json({
            username: user.username,
            email: user.email,
            stats: { watchlistCount, progressCount, reviewCount },
            recentReviews: reviews
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch profile.' });
    }
});

app.get('/protected', verifyToken, (req, res) => {
    res.send('You are authenticated.');
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/pages/registration.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'registration.html'));
});
app.get('/pages/anime.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'anime.html'));
});
app.get('/pages/manga.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'manga.html'));
});
app.get('/pages/nav.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'nav.html'));
});
app.get('/pages/BrowseAnime.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'BrowseAnime.html'));
});
app.get('/pages/BrowseManga.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'BrowseManga.html'));
});
app.get('/pages/mangaInfo.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'mangaInfo.html'));
});
app.get('/pages/animeInfo.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'animeInfo.html'));
});
app.get('/pages/my-list.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'my-list.html'));
});
app.get('/pages/profile.html', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'profile.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});