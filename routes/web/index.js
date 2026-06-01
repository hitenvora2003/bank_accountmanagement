const router = require('express').Router();

router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', (req, res) => res.render('pages/login'));
router.get('/register', (req, res) => res.render('pages/register'));
router.get('/dashboard', (req, res) => res.render('pages/dashboard'));
router.get('/transactions', (req, res) => res.render('pages/transactions'));
router.get('/profile', (req, res) => res.render('pages/profile'));

module.exports = router;
