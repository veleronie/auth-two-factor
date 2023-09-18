const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const router = require("express").Router();
const { authentificator } = require("otplib");

// const secret = speakeasy.generateSecret({
//   name: "WeAreDevs",
// });

// router.get("/", async (req, res) => {
//   qrcode.toDataURL(secret.otpauth_url, function (err, data) {
//     console.log("ops");
//     if (err) console.log("ops");

//     console.log(data);
//     res.render("qrcode", { data });
//   });
// });

module.exports = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    const err = new Error("No log");
    next(err);
  }
};
