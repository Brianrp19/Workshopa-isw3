require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');

const app = express();
app.use(express.json());

// Rutas (prefijo /api)
app.use('/api', routes);

// Conexión Mongo
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(' Error MongoDB:', error);
});

database.once('connected', () => {
    console.log(' Database Connected');
});

// Levantar server
app.listen(3000, () => {
    console.log(` Server Started at 3000`);
});