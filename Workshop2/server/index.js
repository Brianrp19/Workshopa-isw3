const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const path = require('path');
const Course = require('./models/course');

mongoose.connect('mongodb://127.0.0.1:27017/workshop2');
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
});

database.once('connected', () => {
    console.log('Database Connected');
});

const app = express();

//middlewares
app.use(bodyParser.json());
app.use(cors({
    domains: '*',
    methods: '*'
}));

//routes

// Páginas HTML

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'list-courses.html'))
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'create-course.html'))
});

// POST - crear course
app.post('/course', async (req, res) => {
    const course = new Course({
        name: req.body.name,
        credits: req.body.credits
    })

    try {
        const courseCreated = await course.save();
        res.header('Location', `/course?id=${courseCreated._id}`);
        res.status(201).json(courseCreated)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
});

// GET - traer 1 (si viene id) o todos
app.get('/course', async (req, res) => {
    try {
        if (!req.query.id) {
            const data = await Course.find();
            return res.status(200).json(data)
        }
        const data = await Course.findById(req.query.id);
        res.status(200).json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// PUT - actualizar course por id (ruta /course/:id)
app.put('/course/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const updated = await Course.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                credits: req.body.credits
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
});

// DELETE - eliminar course por id
app.delete('/course/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const deleted = await Course.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Deleted", deletedData: deleted });
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
});

//start the app
app.listen(3001, () => console.log(`UTN API service listening on port 3001!`))
