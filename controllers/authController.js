const moment = require('moment');
const User = require("../models/userModel");
const axios = require('axios');
const nodemailer = require('nodemailer');


exports.registerUser = async (req, res) => {
  try {
    const { nama_lengkap, email, tgl_lahir, jenis_kelamin, notelp, password } = req.body;
    const userData = { nama_lengkap, email, tgl_lahir, jenis_kelamin, notelp, password };

    console.log("Received user data:", userData);

    // Check if email already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      console.log("Email sudah terdaftar:", email);
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Check if phone number already exists
    const existingUserByPhone = await User.findByPhone(notelp);
    if (existingUserByPhone) {
      console.log("Nomor telepon sudah terdaftar:", notelp);
      return res.status(400).json({ success: false, message: 'Nomor telepon sudah terdaftar' });
    }

    // Create new user
    await User.create(userData);
    res.status(200).json({ success: true, message: 'Registrasi berhasil' });
    console.log("Registrasi berhasil");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ success: false, message: 'Email tidak sesuai/user belum terdaftar' });
    }

    console.log("User found:", user);

    if (password !== user.password) {
      console.log("Invalid credentials for user:", email);
      return res.status(401).json({ success: false, message: 'Password tidak sesuai' });
    }

    req.session.user = user; // Save user to session
    res.status(200).json({ success: true, message: 'Login berhasil' });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ success: false, message: 'Failed to login user', error: err.message });
  }
};

exports.getProfile = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login?error=Anda harus login terlebih dahulu');
  }

  // Format tanggal lahir
  const user = { ...req.session.user };
  if (user.tgl_lahir) {
    user.tgl_lahir = moment(user.tgl_lahir).format('YYYY-MM-DD');
  }

  res.render('home', { user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { nama_lengkap, jenis_kelamin, notelp, tgl_lahir, email } = req.body;
    const userData = { nama_lengkap, jenis_kelamin, notelp };

    // Periksa apakah tgl_lahir gak kosong
    if (tgl_lahir) {
      userData.tgl_lahir = tgl_lahir;
    }

    console.log("Updating user data:", userData);

    // Update user data
    await User.update(userData, { email });

    // Perbarui data di session
    req.session.user = { ...req.session.user, ...userData };

    res.status(200).json({ success: true, message: 'Profil berhasil diperbarui' });
    console.log("Profil berhasil diperbarui");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const email = req.session.user.email;
    const foto_profil = req.file.filename;

    // Pastikan email dan foto_profil tidak undefined
    if (!email || !foto_profil) {
      throw new Error('Email or profile image is missing');
    }

    await User.updateProfileImage(foto_profil, email);

    // Perbarui sesi pengguna dengan foto profil baru
    req.session.user.foto_profil = foto_profil;

    res.status(200).json({ success: true, message: 'Profile image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile image' });
  }
};

// controller buat API get data ke Jotform
exports.getJotFormData = async (req, res) => {
  try {
    const email = req.session.user.email;
    const apiKey = 'fc56543378a7e3cf6a9d7726a006511f';
    const formId = '250272506396054';

    console.log(`Fetching data for email: ${email}`);

    const response = await axios.get(`https://api.jotform.com/form/${formId}/submissions`, {
      params: {
        apiKey
      }
    });

    const submissions = response.data.content.filter(submission => submission.answers['23']?.answer === email);
    console.log('Filtered Submissions:', submissions);
    res.json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching JotForm data:", error);
    res.status(500).json({ success: false, message: 'Error fetching JotForm data', error: error.message });
  }
};

// controlller buat API get files upload dari jotform
exports.getJotFormFiles = async (req, res) => {
  try {
    const apiKey = 'fc56543378a7e3cf6a9d7726a006511f';
    const formId = '250272506396054';

    const response = await axios.get(`https://api.jotform.com/form/${formId}/files`, {
      params: {
        apiKey: apiKey
      }
    });

    const files = response.data.content;
    res.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching JotForm files:", error);
    res.status(500).json({ success: false, message: 'Error fetching JotForm files', error: error.message });
  }
};


// kontroller buat fitur kontak

exports.sendContactEmail = (req, res) => {
  const { name, email, subject, message } = req.body;

  // Konfigurasi transporter untuk mengirim email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kelompokca@gmail.com', // Ganti dengan email Anda
      pass: 'Unindra1203%'   // Ganti dengan password email Anda
    }
  });

  // Konfigurasi email yang akan dikirim
  const mailOptions = {
    from: email,
    to: 'nugrahaelang@gmail.com',
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  // Kirim email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).json({ success: true, message: 'Email sent successfully' });
    }
  });
};