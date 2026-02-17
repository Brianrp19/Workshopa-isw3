const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const path = require('path');
const Course = require('./models/course');
const Teacher = require('./models/teacher');


mongoose.connect('mongodb://127.0.0.1:27017/workshop3');
const database = mongoose.connection;

// Si algo sale mal con la base, que me avise por consola
database.on('error', (error) => {
    console.log(error)
});


database.once('connected', () => {
    console.log('Base de datos conectada con éxito');
});

const app = express();

// Configuro los permisos y para que el servidor entienda JSON 
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: '*'
}));

// --- ABAJO ESTÁN LAS RUTAS PARA LAS PÁGINAS ---


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'list-courses.html'))
});


app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'create-course.html'))
});


app.get('/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'manage-teachers.html'))
});

// --- AQUÍ EMPIEZAN LAS APIS PARA LOS PROFESORES ---


app.post('/teacher', async (req, res) => {
    const teacher = new Teacher({
        nombre: req.body.nombre,
        apellidos: req.body.apellidos,
        cedula: req.body.cedula,
        edad: req.body.edad
    })

    try {
        const teacherCreated = await teacher.save();
        res.status(201).json(teacherCreated)
    }
    catch (error) {
        res.status(400).json({ message: "No se pudo guardar el profe" })
    }
});

// Para traer la lista o un profe por ID
app.get('/teacher', async (req, res) => {
    try {
        if (!req.query.id) {
            const data = await Teacher.find();
            return res.status(200).json(data)
        }
        const data = await Teacher.findById(req.query.id);
        if (!data) return res.status(404).json({ message: "No encontré al profesor" });
        res.status(200).json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// Para actualizar los datos de alguien
app.put('/teacher/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await Teacher.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Profe no encontrado" });
        }

        res.status(200).json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
});

// Para borrar un profesor
app.delete('/teacher/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Teacher.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "No existe ese profe" });
        }

        res.status(200).json({ message: "Borrado correctamente", deletedData: deleted });
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
});

// --- APIS PARA LOS CURSOS ---

// Crear un curso nuevo
app.post('/course', async (req, res) => {
    const course = new Course({
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        teacherId: req.body.teacherId
    })

    try {
        const courseCreated = await course.save();
        res.status(201).json(courseCreated)
    }
    catch (error) {
        res.status(400).json({ message: "Revisa los datos, algo está mal" })
    }
});

// Traer cursos (aquí uso populate para que se vea el nombre del profe)
app.get('/course', async (req, res) => {
    try {
        if (!req.query.id) {
            const data = await Course.find().populate('teacherId');
            return res.status(200).json(data)
        }
        const data = await Course.findById(req.query.id).populate('teacherId');
        if (!data) return res.status(404).json({ message: "Curso no encontrado" });
        res.status(200).json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// Editar un curso
app.put('/course/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const updated = await Course.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                code: req.body.code,
                description: req.body.description,
                teacherId: req.body.teacherId
            },
            { new: true }
        ).populate('teacherId');

        if (!updated) {
            return res.status(404).json({ message: "No encontré el curso para editar" });
        }

        res.status(200).json(updated);
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
});

// Eliminar un curso
app.delete('/course/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Course.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Ese curso ya no existe" });
        }

        res.status(200).json({ message: "Curso eliminado", deletedData: deleted });
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
});

// Arrancamos el server en el puerto de siempre
app.listen(3001, () => console.log(`Servidor de la UTN corriendo en el puerto 3001`))
