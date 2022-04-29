//coming from passport
module.exports.isLoggedIn = (req, res, next) => {
  //   console.log("req.user...", req.user);

  if (!req.isAuthenticated()) {
    // console.log(req.path, req.originalUrl);
    //returning to the page from where we are logging in
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must be signed in first!");
    return res.redirect("/login");
  }
  next();
};
