const db = require("../config/db");

const User = {
  create: (userData) => {
    const query = `
      INSERT INTO users (nama_lengkap, email, tgl_lahir, jenis_kelamin, notelp, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [
          userData.nama_lengkap,
          userData.email,
          userData.tgl_lahir,
          userData.jenis_kelamin,
          userData.notelp,
          userData.password,
        ],
        (err, results) => {
          if (err) {
            console.error("Error inserting user:", err);
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  findByEmail: (email) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    return new Promise((resolve, reject) => {
      db.query(query, [email], (err, results) => {
        if (err) {
          console.error("Error finding user by email:", err);
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  },

  findByPhone: (notelp) => {
    const query = `SELECT * FROM users WHERE notelp = ?`;
    return new Promise((resolve, reject) => {
      db.query(query, [notelp], (err, results) => {
        if (err) {
          console.error("Error finding user by phone:", err);
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  },

  updateProfileImage: async (foto_profil, email) => {
    const query = `
      UPDATE users SET foto_profil = ? WHERE email = ?
    `;
    const values = [foto_profil, email];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, results) => {
        if (err) {
          console.error("Error updating profile image:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  update: (userData, { email }) => {
    const query = `
      UPDATE users
      SET nama_lengkap = ?, jenis_kelamin = ?, notelp = ?, tgl_lahir = ?
      WHERE email = ?
    `;
    const values = [
      userData.nama_lengkap,
      userData.jenis_kelamin,
      userData.notelp,
      userData.tgl_lahir,
      email
    ];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, results) => {
        if (err) {
          console.error("Error updating user:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
};

module.exports = User;