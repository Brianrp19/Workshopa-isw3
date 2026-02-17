const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const path = require('path');
const Course = require('./models/course');

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/workshop2');
const database = mongoose.connection;

// Manejo de errores de la base de datos
database.on('error', (error) => {
    console.log(error)
});

// Confirmación de conexión exitosa
database.once('connected', () => {
    console.log('Database Connected');
});

const app = express();

// Middlewares: configuración para procesar datos JSON y permitir CORS
app.use(bodyParser.json());
app.use(cors({
    domains: '*',
    methods: '*'
}));

// --- RUTAS DE PÁGINAS HTML ---

// Ruta raíz: Sirve la página de lista de cursos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'list-courses.html'))
});

// Ruta /home: Sirve la página para crear cursos
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'create-course.html'))
});

//  RUTAS DE LA API (CRUD) 

// POST: Crea un nuevo curso en la base de datos
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

// GET: Obtiene todos los cursos o uno específico si se envía un ID por parámetro
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

// PUT: Actualiza un curso existente buscando por su ID
app.put('/course/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const updated = await Course.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                credits: req.body.credits
            },
            { new: true } // Retorna el documento actualizado
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

// DELETE: Elimina un curso de la base de datos por su ID
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

// Inicia el servidor en el puerto 3001
app.listen(3001, () => console.log(`UTN API service listening on port 3001!`))
