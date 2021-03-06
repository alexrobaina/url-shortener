const express = require("express");
const links = require("./links");
const { link } = require("../models/index");
const handleAsync = require("../handlers/async-handler");
const router = express.Router();

router.use("/link", links);

/* GET home page. */
router.get(
  "/:link",
  handleAsync(async function (req, res, next) {
    let {
      headers: { referer },
      connection: { remoteAddress: ipAddress },
      params: { link: slug },
    } = req;
    const originalUrl = await link.findOne({ slug });
    const hasExpired = Date.now() > new Date(originalUrl.expiresAt).getTime();
    if (!originalUrl) return next();
    if (hasExpired) {
      return next(Error("slug has expire"));
    }
    originalUrl.clicks++;
    originalUrl.visit.push({
      referer,
      ipAddress,
    });
    await originalUrl.save();
    res.redirect(originalUrl.url);
  })
);

// TODO:
// get CLICK TIME AND DATE
// get click referer

module.exports = router;
