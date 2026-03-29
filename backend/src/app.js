const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const furnitureRoutes = require('./routes/furnitures');
const roomRoutes      = require('./routes/rooms');
const layoutRoutes    = require('./routes/layouts');
const uploadRoutes    = require('./routes/upload');
const errorHandler    = require('./middlewares/errorHandler');
const removebgRoutes   = require('./routes/removebg');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/furnitures', furnitureRoutes);
app.use('/api/rooms',      roomRoutes);
app.use('/api/layouts',    layoutRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/removebg',   removebgRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;