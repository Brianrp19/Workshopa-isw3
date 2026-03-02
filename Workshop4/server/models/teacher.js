const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    nombre: {
        required: true,
        type: String
    },
    apellidos: {
        required: true,
        type: String
    },
    cedula: {
        required: true,
        type: String,
        unique: true
    },
    edad: {
        required: true,
        type: Number
    }
});

module.exports = mongoose.model('Teacher', teacherSchema);
