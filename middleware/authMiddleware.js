module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.session.user) {
        return next();
      } else {
        res.redirect('/login?error=Anda harus login terlebih dahulu');
      }
    }
  };