import express from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const db = new sqlite3.Database("./db/showclinic.db");
router.use(bodyParser.json());

/* ==============================================
   📁 CONFIGURAR SUBIDA DE DOCUMENTOS PDF
============================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/docs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ==============================================
   🧱 CREAR PRODUCTO
============================================== */
router.post("/crear", (req, res) => {
  const {
    producto,
    marca,
    sku,
    proveedor,
    contenido,
    precio,
    stock,
    fechaVencimiento,
    actualizado_por,
  } = req.body;

  if (!producto || !marca) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const query = `
    INSERT INTO inventario 
      (producto, marca, sku, proveedor, contenido, precio, stock, fechaVencimiento, ultima_actualizacion, actualizado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-5 hours'), ?)
  `;

  db.run(
    query,
    [
      producto,
      marca,
      sku,
      proveedor,
      contenido,
      precio,
      stock,
      fechaVencimiento,
      actualizado_por || "Desconocido",
    ],
    function (err) {
      if (err) {
        console.error("❌ Error al registrar producto:", err.message);
        return res.status(500).json({ message: "Error al registrar producto" });
      }
      res.json({ message: "✅ Producto registrado correctamente" });
    }
  );
});

/* ==============================================
   📋 LISTAR PRODUCTOS
============================================== */
router.get("/listar", (req, res) => {
  db.all("SELECT * FROM inventario ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error("❌ Error al listar productos:", err.message);
      return res.status(500).json({ message: "Error al listar productos" });
    }
    res.json(rows);
  });
});

/* ==============================================
   ✏️ EDITAR PRODUCTO
============================================== */
router.put("/editar/:id", (req, res) => {
  const { id } = req.params;
  const {
    producto,
    marca,
    sku,
    proveedor,
    contenido,
    precio,
    stock,
    fechaVencimiento,
    actualizado_por,
  } = req.body;

  const query = `
    UPDATE inventario SET 
      producto = ?, 
      marca = ?, 
      sku = ?, 
      proveedor = ?, 
      contenido = ?, 
      precio = ?, 
      stock = ?, 
      fechaVencimiento = ?, 
      ultima_actualizacion = datetime('now', '-5 hours'),
      actualizado_por = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [
      producto,
      marca,
      sku,
      proveedor,
      contenido,
      precio,
      stock,
      fechaVencimiento,
      actualizado_por || "Desconocido",
      id,
    ],
    function (err) {
      if (err) {
        console.error("❌ Error al editar producto:", err.message);
        return res.status(500).json({ message: "Error al editar producto" });
      }
      res.json({ message: "✅ Producto actualizado correctamente" });
    }
  );
});

/* ==============================================
   📄 SUBIR DOCUMENTO PDF POR PRODUCTO
============================================== */
router.post("/subir-pdf/:id", upload.single("documento"), (req, res) => {
  const { id } = req.params;
  if (!req.file)
    return res.status(400).json({ message: "No se subió ningún archivo PDF" });

  db.run(
    `
    UPDATE inventario 
    SET documento_pdf = ?, ultima_actualizacion = datetime('now', '-5 hours')
    WHERE id = ?
  `,
    [req.file.filename, id],
    function (err) {
      if (err) {
        console.error("❌ Error al guardar PDF:", err.message);
        return res.status(500).json({ message: "Error al guardar PDF" });
      }
      res.json({ message: "✅ Documento PDF guardado correctamente" });
    }
  );
});

/* ==============================================
   🗑️ ELIMINAR PRODUCTO
============================================== */
router.delete("/eliminar/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM inventario WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("❌ Error al eliminar producto:", err.message);
      return res.status(500).json({ message: "Error al eliminar producto" });
    }
    res.json({ message: "✅ Producto eliminado correctamente" });
  });
});

export default router;
