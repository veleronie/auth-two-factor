const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const userLoggedSession = require("./two-factor");
const { authentificator } = require("otplib");
const url = require("url");
const { registerValidation, loginValidation } = require("../validation");
// valid
router.get("/register", async (req, res) => {
  res.render();
});
router.post("/register", async (req, res) => {
  //res.render("register");
  //const valid = schema.validate(req.body);
  //console.log(valid);
  const valid = registerValidation(req.body);
  if (valid.error) {
    const error = valid.error.details[0].message;
    if (error) return res.status(400).send(error);
    console.log("shit");
  }

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");
  //passord

  const salt = await bcrypt.genSalt(5);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const tempSecret = speakeasy.generateSecret({ name: "laba" });

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    secret: tempSecret,
  });
  try {
    const baseSecret = user.secret;
    // const { base32: secret } = user.secret;
    // res.redirect(
    //   url.format({
    //     pathname: "messages",
    //     query: {
    //       secretKey: JSON.stringify(secret),
    //     },
    //   })
    // );
    //console.log(baseSecret);

    qrcode.toDataURL(baseSecret.otpauth_url, function (err, data) {
      //console.log(req.body.secret);
      res.render("../views/qrcode", { data });
    });
    const savedUser = await user.save();
    console.log("SAVED");

    //res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.get("/messages", (req, res, next) => {
  //console.log(req.query);
  res.send(req.query.secretKey);
  next();
});
router
  .post("/login", async (req, res, next) => {
    console.log("aaaa");
    const valid = loginValidation(req.body);
    if (valid.error) {
      const error = valid.error.details[0].message;
      if (error) return res.status(400).send(error);
      console.log("shit");
    }
    const userExists = await User.findOne({ email: req.body.email });
    if (!userExists) return res.status(400).send("Email/pass no exists");
    //PASS??
    const validPass = await bcrypt.compare(
      req.body.password,
      userExists.password
    );
    if (!validPass) return res.status(400).send("Inv Password");

    const baseSecret = userExists.secret;
    // res.redirect(
    //   url.format({
    //     pathname: "two-factor",
    //     query: {
    //       secretKey: JSON.stringify(userExists.secret),
    //       somesgit: "someshit",
    //     },
    //   })
    // );

    req.session.user = userExists;
    res.redirect("two-factor");

    console.log(
      "You have passed the first step. Click here to enter the second one"
    );
    //res.send("OK");
    //req.user = validPass;
    //res.redirect('two-factor');

    // qrcode.toDataURL(baseSecret.otpauth_url, function (err, data) {
    //   //console.log(req.body.secret);
    //   res.render("../views/qrcode", { data });
    // });
  })
  .post("/new", async (req, res) => {
    const userExists = await User.findOne({ email: req.body.email });
    //res.send(req.body);
    let token = req.body.token;
    console.log(req.body.token);
    token = parseInt(token);

    const { base32: secret } = userExists.secret;
    console.log(secret);
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });
    if (verified) {
      const token = jwt.sign({ _id: userExists._id }, process.env.TOKEN);
      console.log("2 STEP DONE");
      res.header("auth-token", token).send(token);
    } else {
      res.send("Went wrong");
    }
  });

router
  .get("/qrcode", (req, res) => {
    console.log(
      "Here is the page where you need to enter the token from the QR code"
    );
    res.send("OK");
  })
  .post("/qrcode", (req, res) => {
    console.log(
      "Here is the page where you need to enter the token from the QR code"
    );
    res.redirect("api/posts");
  });
router.get("/two-factor", (req, res) => {
  res.send("enter the token");
});
router.post("/two-factor", userLoggedSession, async (req, res, next) => {
  console.log("You have entered the second step...");
  // const userExists = await User.findOne({ email: req.body.email });
  // if (!userExists) return res.status(400).send("Email/pass no exists");
  userExists = req.session.user;
  const { base32: secret } = userExists.secret;
  let token = req.body.token;
  //console.log(req.body.token);
  console.log(secret);
  token = parseInt(token);
  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });
  if (verified) {
    const token = jwt.sign({ _id: userExists._id }, process.env.TOKEN);
    console.log(token);
    // destroy the session
    req.session.destroy(() => {
      console.log("session d");
    });
    res.header("auth-token", token);
    res.redirect("/api/posts");
    //res.set({ "auth-token": token }).redirect("/api/posts");
  } else {
    res.send("Went wrong");
  }
});

module.exports = router;
