const express = require("express");
const router = express.Router();

router.get("/",  (req, res) => 
  res.render("pages/login")
);

router.get("/dashboard", (req, res) => 
  res.render("pages/dashboard"));
router.get("/transaction", (req, res) => 
  res.render("pages/transactions"));
router.get("/transfer" ,(req, res) => 
  res.render("pages/transfer"));
router.get("/history", (req, res) => 
  res.render("pages/history"));
router.get("/beneficiaries", (req, res) => 
  res.render("pages/beneficiaries"));
router.get("/profile", (req, res) => 
  
  res.render("pages/profile"));

module.exports = router;