const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const contactController = require('./controllers/authController');

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public")); // Pastikan direktori public disajikan sebagai direktori statis
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 300000 } //3600000 = 1 jam
  })
);

// Middleware untuk memantau aktivitas pengguna
app.use((req, res, next) => {
  if (req.session.user) {
    req.session._garbage = Date();
    req.session.touch();
  }
  next();
});

// Middleware untuk logging semua permintaan
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use(authRoutes);
app.post('/send-contact-email', contactController.sendContactEmail);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});