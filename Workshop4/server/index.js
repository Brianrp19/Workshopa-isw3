const { authenticateToken, generateToken, register } = require('./controllers/auth');
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const path = require('path');
const Course = require('./models/course');
const Teacher = require('./models/teacher');

mongoose.connect('mongodb://127.0.0.1:27017/workshop3');
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
});

database.once('connected', () => {
    console.log('Database Connected');
});

const app = express();

app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: '*'
}));

// Servir archivos estáticos de la carpeta client
app.use(express.static(path.join(__dirname, '..', 'client')));

app.post('/auth/token', generateToken);
app.post('/auth/register', register);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'list-courses.html'))
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'login.html'))
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'register.html'))
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'create-course.html'))
});

app.get('/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'manage-teachers.html'))
});

app.post('/teacher', authenticateToken, async (req, res) => {
    const teacher = new Teacher({
        nombre: req.body.nombre,
        apellidos: req.body.apellidos,
        cedula: req.body.cedula,
        edad: req.body.edad
    })
    try {
        const teacherCreated = await teacher.save();
        res.status(201).json(teacherCreated)
    } catch (error) {
        res.status(400).json({ message: "Error" })
    }
});

app.get('/teacher', authenticateToken, async (req, res) => {
    try {
        if (!req.query.id) {
            const data = await Teacher.find();
            return res.status(200).json(data)
        }
        const data = await Teacher.findById(req.query.id);
        if (!data) return res.status(404).json({ message: "Not found" });
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

app.put('/teacher/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await Teacher.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Not found" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

app.delete('/teacher/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Teacher.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Deleted", deletedData: deleted });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

app.post('/course', authenticateToken, async (req, res) => {
    const course = new Course({
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        teacherId: req.body.teacherId
    })
    try {
        const courseCreated = await course.save();
        res.status(201).json(courseCreated)
    } catch (error) {
        res.status(400).json({ message: "Error" })
    }
});

app.get('/course', authenticateToken, async (req, res) => {
    try {
        if (!req.query.id) {
            const data = await Course.find().populate('teacherId');
            return res.status(200).json(data)
        }
        const data = await Course.findById(req.query.id).populate('teacherId');
        if (!data) return res.status(404).json({ message: "Not found" });
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

app.put('/course/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await Course.findByIdAndUpdate(id, req.body, { new: true }).populate('teacherId');
        if (!updated) return res.status(404).json({ message: "Not found" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

app.delete('/course/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Course.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ message: "Deleted", deletedData: deleted });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

app.listen(3001, () => console.log(`Server running on port 3001`));