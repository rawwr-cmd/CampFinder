const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("camp/index", { campgrounds });
};

module.exports.renderNewform = async (req, res) => {
  res.render("camp/new");
};

module.exports.createCampground = async (req, res, next) => {
  // if (!req.body.campground)
  //   throw new expressError("Invalid Campground Data", 404);

  const campground = new Campground(req.body.campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  // console.log(campground);
  req.flash("success", "successfully made a new campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    //nesting populate (populating reviews within Campground and then populating Author within reviews)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  // console.log(campground);
  if (!campground) {
    req.flash("error", "Cannot find the campground");
    return res.redirect("/campgrounds");
  }
  // console.log(campground);
  res.render("camp/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find the campground");
    return res.redirect("/campgrounds");
  }
  res.render("camp/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  // res.send("it worked");
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs); //spreading
  campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: {
        images: {
          filename: {
            $in: req.body.deleteImages,
          },
        },
      },
    });
    console.log(campground);
  }
  req.flash("success", "successfully updated campground!");
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "successfully deleted campground!");
  res.redirect("/campgrounds");
};
