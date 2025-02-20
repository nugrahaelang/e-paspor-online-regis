const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multer = require("multer");
const path = require("path");
const { ensureAuthenticated } = require("../middleware/authMiddleware");

// config multer utk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter hanya jpg dan png
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file JPG dan PNG yang diizinkan!'));
  }
};

const upload = multer({ 
  storage,
  fileFilter
});

router.get("/", (req, res) => res.render("index")); 

router.get("/register", (req, res) => res.render("register"));
router.post("/register", authController.registerUser);

router.get("/login", (req, res) => res.render("login"));
router.post("/login", authController.loginUser);

router.get('/home', authController.getProfile);

router.post('/update-profile', authController.updateProfile);

// Endpoint untuk upload foto profil
router.post('/upload-profile-image', upload.single('profileImage'), authController.uploadProfileImage);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to logout.");
    }
    res.redirect("/login");
  });
});

router.get("/index", (req, res) => {
    res.render("index");
});

// Rute untuk halaman beranda
router.get("/beranda", ensureAuthenticated, (req, res) => {
  res.render("beranda", { user: req.session.user });
});

// Rute untuk halaman riwayat
router.get("/riwayat", ensureAuthenticated, (req, res) => {
  res.render("riwayat", { user: req.session.user });
});

// route buat API get data ke Jotform
router.get('/jotform-data', ensureAuthenticated, authController.getJotFormData);

module.exports = router;