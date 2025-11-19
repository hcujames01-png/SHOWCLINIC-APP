const bcrypt = require("bcryptjs");
const db = require("./database");

(async () => {
  const hash = await bcrypt.hash("1234", 10);

  db.serialize(() => {
    db.run("DELETE FROM users");
    db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["doctor", hash, "doctor"]
    );
    db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["admin", hash, "admin"]
    );
    console.log("Usuarios reiniciados con contraseña 1234");
  });

  db.close();
})();
