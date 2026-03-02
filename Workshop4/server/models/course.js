const mongoose = require('mongoose');

// Definición del esquema para la colección de cursos
const courseSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    code: {
        required: true,
        type: String,
        unique: true
    },
    description: {
        required: true,
        type: String
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    }
})

module.exports = mongoose.model('Course', courseSchema)
