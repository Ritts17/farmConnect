// FILE 4: routes/userRoutes.js
const express = require('express');
const { addUser, getUserByEmailAndPassword, logout } = require('../controllers/userController.js');

const router = express.Router();

router.post('/users/signup', addUser);
router.post('/users/login', getUserByEmailAndPassword);
router.post('/users/logout', logout);

module.exports = router;