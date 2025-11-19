import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";

import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patientRoutes.js";
import treatmentRoutes from "./routes/treatmentRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import especialistasRoutes from "./routes/especialistas.js";
import finanzasRoutes from "./routes/finanzasRoutes.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Servir imágenes de forma pública (📸 importante para ver las fotos)
app.use("/uploads", express.static("uploads"));

// ✅ Conexión a la base de datos SQLite
const db = new sqlite3.Database("./db/showclinic.db", (err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err.message);
  } else {
    console.log("✅ Conectado a showclinic.db");

    // 🧱 Tabla de usuarios (login)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `);

    // 🧱 Tabla de pacientes
    db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dni TEXT,
        nombre TEXT,
        apellido TEXT,
        edad INTEGER,
        sexo TEXT,
        direccion TEXT,
        ocupacion TEXT,
        fechaNacimiento TEXT,
        ciudadNacimiento TEXT,
        ciudadResidencia TEXT,
        alergias TEXT,
        enfermedad TEXT,
        correo TEXT,
        celular TEXT,
        cirugiaEstetica TEXT,
        drogas TEXT,
        tabaco TEXT,
        alcohol TEXT,
        referencia TEXT,
        fechaRegistro TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 🧱 Tabla de tratamientos base
    db.run(`
      CREATE TABLE IF NOT EXISTS tratamientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        descripcion TEXT
      )
    `);

    // 🧱 Tabla de tratamientos realizados
    db.run(`
      CREATE TABLE IF NOT EXISTS tratamientos_realizados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER,
        tratamiento_id INTEGER,
        productos TEXT,
        cantidad_total INTEGER,
        precio_total REAL,
        descuento REAL,
        pagoMetodo TEXT,
        sesion INTEGER,
        tipoAtencion TEXT,
        especialista TEXT,
        foto_izquierda TEXT,
        foto_frontal TEXT,
        foto_derecha TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(paciente_id) REFERENCES patients(id),
        FOREIGN KEY(tratamiento_id) REFERENCES tratamientos(id)
      )
    `);

    // 🧱 Tabla de inventario
    db.run(`
      CREATE TABLE IF NOT EXISTS inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto TEXT,
        marca TEXT,
        sku TEXT,
        proveedor TEXT,
        precio REAL,
        stock INTEGER,
        fechaVencimiento TEXT
      )
    `);

    console.log("🧩 Todas las tablas listas para usar ✅");
  }
});

// ✅ Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/pacientes", patientRoutes);
app.use("/api/tratamientos", treatmentRoutes);
app.use("/api/inventario", inventoryRoutes);
app.use("/api/especialistas", especialistasRoutes);
app.use("/api/finanzas", finanzasRoutes);
app.use("/uploads/docs", express.static("uploads/docs"));


// ✅ Servidor en puerto 4000
const PORT = 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Servidor backend disponible en red en http://0.0.0.0:${PORT}`)
);
