const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Model = require("./models/model");

const app = express();
app.use(express.json());

// Conexión Mongo
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

db.on("error", (err) => console.log(err));
db.once("open", () => console.log("Database Connected"));

// POST - crear
app.post("/api/post", async (req, res) => {
    try {
        const data = new Model({
            name: req.body.name,
            age: req.body.age,
        });

        const saved = await data.save();
        res.status(200).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET - traer todos
app.get("/api/getAll", async (req, res) => {
    try {
        const data = await Model.find();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET ONE - por id
app.get("/api/getOne/:id", async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        if (!data) return res.status(404).json({ message: "No encontrado" });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH - actualizar por id
app.patch("/api/update/:id", async (req, res) => {
    try {
        const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "No encontrado" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE - eliminar por id
app.delete("/api/delete/:id", async (req, res) => {
    try {
        const deleted = await Model.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "No encontrado" });
        res.status(200).json({ message: "Eliminado correctamente", deletedData: deleted });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Server
app.listen(3000, () => console.log("Server started on port 3000"));
