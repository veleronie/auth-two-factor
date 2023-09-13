const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const { authentificator } = require("otplib");
const url = require("url");
const { registerValidation, loginValidation } = require("../validation");
// valid

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
    // res.redirect(
    //   url.format({
    //     pathname: "messages",
    //     query: {
    //       secretKey: userExists.secret,
    //       somesgit: "someshit",
    //     },
    //   })
    // );
    console.log(baseSecret);

    qrcode.toDataURL(baseSecret.otpauth_url, function (err, data) {
      //console.log(req.body.secret);
      res.render("../views/qrcode", { data });
    });
    const savedUser = await user.save();

    //res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res, next) => {
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
  //     pathname: "messages",
  //     query: {
  //       secretKey: userExists.secret,
  //       somesgit: "someshit",
  //     },
  //   })
  // );
  console.log(userExists.secret);

  qrcode.toDataURL(baseSecret.otpauth_url, function (err, data) {
    //console.log(req.body.secret);
    res.render("../views/qrcode", { data });
  });
});
router.get("/messages", (req, res) => {
  console.log(req.query);
  res.send(req.query);
});
router.post("/two-factor", async (req, res, next) => {
  const userExists = await User.findOne({ email: req.body.email });
  if (!userExists) return res.status(400).send("Email/pass no exists");
  const { base32: secret } = userExists.secret;
  let token = req.body.token;
  token = parseInt(token);
  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });
  if (verified) {
    const token = jwt.sign({ _id: userExists._id }, process.env.TOKEN);
    res.header("auth-token", token).send(token);
  } else {
    res.send("Went wrong");
  }
});

module.exports = router;
