const db = require("./database");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  // Insertar 2 usuarios base
  db.run(
    `INSERT OR IGNORE INTO users (id, username, password, role)
     VALUES
     (1, 'doctor', '$2a$10$5CHYBdwH2l8uBCBhx4j64uApU4OAT4frHq32uv2YFf3ulYb7QUa1e', 'doctor'),
     (2, 'admin', '$2a$10$5CHYBdwH2l8uBCBhx4j64uApU4OAT4frHq32uv2YFf3ulYb7QUa1e', 'admin')`
  );

  console.log("Tablas creadas y usuarios insertados (doctor / admin)");
});

db.close();
