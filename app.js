if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// console.log(process.env.SECRET);
// require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const expressError = require("./utils/ExpressError");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const MongoDBStore = require("connect-mongo");

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// "mongodb://localhost:27017/yelp-camp"
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//parsing the body of the request
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({ replaceWith: "_" }));

const secret = process.env.SECRET || "thisisabettersession";

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    name: "session",
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dv5vm4sqh/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/rawwr/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
      childSrc: ["blob:"],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware
app.use((req, res, next) => {
  // console.log(req.session);
  // console.log(req.query);
  res.locals.currentUser = req.user; //for those who signed in
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.get("/fakeuser", async (req, res) => {
//   const user = new User({ email: "akshay@gmail.com", username: "akshay" });
//   //User.register('takes user', 'takes password')
//   const newUser = await User.register(user, "chicken");
//   res.send(newUser);
// });

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new expressError("Page not Found", 400));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  // console.log(err.message);
  if (!err.message) err.message = "Oh No, Something went Wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("serving at 3000");
});
