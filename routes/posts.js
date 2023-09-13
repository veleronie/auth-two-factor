const router = require("express").Router();
const User = require("../model/User");
const verify = require("./verifyToken");
const bcrypt = require("bcryptjs");
router.get("/", verify, async (req, res) => {
  const display = await User.findOne({ _id: req.user._id });
  res.json(display);
});

router.put("/update", verify, async (req, res) => {
  const salt = await bcrypt.genSalt(5);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  await User.findByIdAndUpdate(
    { _id: req.user._id },
    {
      email: req.body.email,
      password: hashPassword,
    }
  );

  res.redirect("/api/posts");
});

module.exports = router;
