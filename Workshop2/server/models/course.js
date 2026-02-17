const mongoose = require('mongoose');

// Definición del esquema para la colección de cursos
const courseSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String // El nombre es obligatorio y de tipo texto
    },
    credits: {
        required: true,
        type: Number // Los créditos son obligatorios y de tipo numérico
    }
})

// Exporta el modelo para que pueda ser usado en otras partes de la aplicación
module.exports = mongoose.model('Course', courseSchema)
