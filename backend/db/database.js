const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "showclinic.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Error conectando a la base de datos", err);
  else console.log("Base de datos SQLite conectada en", dbPath);
});

module.exports = db;
