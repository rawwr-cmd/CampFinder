const { campgroundSchema, reviewSchema } = require("./schemas");
const expressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
//coming from passport
module.exports.isLoggedIn = (req, res, next) => {
  // user info created is req.user
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

//joi Validation Middleware Campground
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do this");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//campground/id/review/reviewId
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do this");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//joi Validation Middleware Review
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};
