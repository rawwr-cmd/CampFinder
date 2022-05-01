const express = require("express");
const router = express.Router({ mergeParams: true }); //for accessing id from app.js params

const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const expressError = require("../utils/ExpressError");

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review added!");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash("success", "Successfully deleted review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
