const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect("/dashboard");
    }
  } catch (e) {}
  next();
};

const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.redirect("/");
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    res.redirect("/");
  }
};

router.get("/", isLoggedIn, (req, res) => {
  res.render("pages/login");
});

router.get("/dashboard", requireAuth, (req, res) => res.render("pages/dashboard"));
router.get("/transaction", requireAuth, (req, res) => res.render("pages/transactions"));
router.get("/transfer", requireAuth, (req, res) => res.render("pages/transfer"));
router.get("/history", requireAuth, (req, res) => res.render("pages/history"));
router.get("/beneficiaries", requireAuth, (req, res) => res.render("pages/beneficiaries"));
router.get("/profile", requireAuth, (req, res) => res.render("pages/profile"));

module.exports = router;