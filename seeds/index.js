const mongoose = require("mongoose");
const cities = require("./cities");
//destructring
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "626c13ee4af39820b8af9e11",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda consequuntur odio sunt quo eveniet placeat quasi corrupti nostrum ea quidem rem omnis sint repudiandae excepturi repellat, obcaecati tempore perspiciatis optio.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/rawwr/image/upload/v1651512282/camp/ym0vbhnthewq4elsjome.jpg",
          filename: "camp/ym0vbhnthewq4elsjome",
        },
        {
          url: "https://res.cloudinary.com/rawwr/image/upload/v1651512281/camp/d8c1p4ocvklrofqblxls.jpg",
          filename: "camp/d8c1p4ocvklrofqblxls",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
