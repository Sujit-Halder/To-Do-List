const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Example route
app.get('/api', (req, res) => {
    res.send('API working!');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
