const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/rawwr/image/upload/w_300/v1651512282/camp/ym0vbhnthewq4elsjome.jpg

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  // console.log(doc);
  if (doc) {
    const res = await Review.deleteMany({ _id: { $in: doc.reviews } });
    // console.log(res);
  }
});

const Campground = mongoose.model("Campground", CampgroundSchema);
//exporting
module.exports = Campground;

//or
//module.exports = mongoose.model('Campground', CampgroundSchema)
