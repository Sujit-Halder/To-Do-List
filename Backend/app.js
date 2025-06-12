const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({
    origin: 'https://to-do-list-1-ym2j.onrender.com',
    credentials: true 
  }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Example route
app.get('/api', (req, res) => {
    res.send('API working!');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
