const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "admin",
  database: "elang",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err.stack);
    return;
  }
  console.log("Connected to MySQL as ID " + db.threadId);
});

db.on('error', (err) => {
  console.error('Database error: ', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    // Reconnect if the connection is lost
    db.connect((err) => {
      if (err) {
        console.error("Reconnection failed: ", err.stack);
        return;
      }
      console.log("Reconnected to MySQL as ID " + db.threadId);
    });
  } else {
    throw err;
  }
});

module.exports = db;