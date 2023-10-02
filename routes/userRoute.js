const express = require('express');
const { loginUser, registerUser } = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);

router.get('/protected-route', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

router.get('/admin-route', verifyToken, verifyRole(['admin']), (req, res) => {
  res.json({ message: 'This is an admin-only route' });
});

module.exports = router;
