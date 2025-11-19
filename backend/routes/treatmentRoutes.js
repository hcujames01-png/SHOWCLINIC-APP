import express from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const db = new sqlite3.Database("./db/showclinic.db");
router.use(bodyParser.json());

/* ==============================
   📁 CONFIGURAR SUBIDA DE FOTOS
============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ==============================
   💊 CRUD TRATAMIENTOS BASE
============================== */

// ✅ Crear tratamiento
router.post("/crear", (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre || !descripcion) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  db.run(
    `INSERT INTO tratamientos (nombre, descripcion) VALUES (?, ?)`,
    [nombre, descripcion],
    function (err) {
      if (err)
        return res.status(500).json({ message: "Error al crear tratamiento" });
      res.json({ id: this.lastID, nombre, descripcion });
    }
  );
});

// ✅ Listar tratamientos
router.get("/listar", (req, res) => {
  db.all("SELECT * FROM tratamientos ORDER BY id DESC", [], (err, rows) => {
    if (err)
      return res.status(500).json({ message: "Error al listar tratamientos" });
    res.json(rows);
  });
});

/* ==============================
   📦 PRODUCTOS Y MARCAS
============================== */

router.get("/productos", (req, res) => {
  db.all("SELECT * FROM inventario ORDER BY producto ASC", [], (err, rows) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener productos" });
    res.json(rows);
  });
});

router.get("/marcas", (req, res) => {
  db.all(
    "SELECT DISTINCT marca FROM inventario WHERE marca IS NOT NULL AND marca != '' ORDER BY marca ASC",
    [],
    (err, rows) => {
      if (err)
        return res.status(500).json({ message: "Error al obtener marcas" });
      res.json(rows);
    }
  );
});

/* ==============================
   💉 REGISTRO DE TRATAMIENTOS REALIZADOS
============================== */

router.post("/realizado", upload.array("fotos", 3), (req, res) => {
  try {
    const { paciente_id, productos, pagoMetodo, sesion, especialista, tipoAtencion } = req.body;
    const productosData = JSON.parse(productos);

    if (!productosData || productosData.length === 0)
      return res.status(400).json({ message: "No se enviaron tratamientos" });

    const fechaLocal = new Date()
      .toLocaleString("sv-SE")
      .replace("T", " ")
      .slice(0, 19);

    // 🔁 Procesar cada tratamiento
    productosData.forEach((b) => {
      const subtotal = b.precio * b.cantidad;
      const descuentoAplicado = (b.descuento / 100) * subtotal;
      const totalFinal = subtotal - descuentoAplicado;

      db.run(
        `
        INSERT INTO tratamientos_realizados 
        (paciente_id, tratamiento_id, productos, cantidad_total, precio_total, descuento, pagoMetodo, especialista, sesion, tipoAtencion, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          paciente_id,
          b.tratamiento_id || null,
          JSON.stringify([{ producto: b.producto, cantidad: b.cantidad, precio: b.precio }]),
          b.cantidad,
          totalFinal,
          b.descuento || 0,
          pagoMetodo,
          especialista || "No especificado",
          sesion || 1,
          tipoAtencion || "Tratamiento",
          fechaLocal,
        ],
        function (err) {
          if (err) {
            console.error("❌ Error al registrar:", err.message);
          } else {
            console.log(`✅ Tratamiento registrado correctamente (ID ${this.lastID})`);
          }
        }
      );

      // 🔻 Actualizar stock
      db.run(
        `UPDATE inventario SET stock = stock - ? WHERE producto = ?`,
        [b.cantidad, b.producto],
        (err) => {
          if (err) console.error(`Error al actualizar stock de ${b.producto}`);
        }
      );
    });

    res.json({ message: "✅ Tratamientos registrados correctamente" });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/* ==============================
   📸 SUBIR FOTOS DEL TRATAMIENTO
============================== */

router.post("/subir-fotos/:id", upload.array("fotos", 3), (req, res) => {
  const { id } = req.params;
  const files = req.files;

  if (!files || files.length === 0)
    return res.status(400).json({ message: "No se han subido imágenes" });

  const foto_izquierda = files[0]?.filename || null;
  const foto_frontal = files[1]?.filename || null;
  const foto_derecha = files[2]?.filename || null;

  db.run(
    `UPDATE tratamientos_realizados 
     SET foto_izquierda = ?, foto_frontal = ?, foto_derecha = ?
     WHERE id = ?`,
    [foto_izquierda, foto_frontal, foto_derecha, id],
    function (err) {
      if (err) {
        console.error("❌ Error al guardar fotos:", err.message);
        return res.status(500).json({ message: "Error al guardar fotos" });
      }
      res.json({ message: "✅ Fotos guardadas correctamente" });
    }
  );
});

/* ==============================
   📋 HISTORIAL CLÍNICO
============================== */

router.get("/historial/:paciente_id", (req, res) => {
  const { paciente_id } = req.params;
  db.all(
    `
    SELECT tr.*, t.nombre AS nombreTratamiento
    FROM tratamientos_realizados tr
    LEFT JOIN tratamientos t ON t.id = tr.tratamiento_id
    WHERE tr.paciente_id = ?
    ORDER BY tr.fecha DESC
  `,
    [paciente_id],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al obtener historial clínico" });
      res.json(rows);
    }
  );
});

export default router;
