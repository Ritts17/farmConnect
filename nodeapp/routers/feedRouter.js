
const { addFeed, deleteFeed, getAllFeeds, getFeedById, updateFeed, getSupplierFeeds } = require("../controllers/feedController");
const express = require('express');
const { validateToken, authorizeRoles } = require('../authUtils');

const router = express.Router();

// Public routes
router.get('/feed/getAllFeeds', getAllFeeds);
router.get('/feed/getFeedById/:id', getFeedById);

// Supplier-only routes
router.get('/feed/supplier/my-feeds', validateToken, authorizeRoles('Supplier'), getSupplierFeeds);
router.post('/feed/addFeed', validateToken, authorizeRoles('Supplier'), addFeed);
router.put('/feed/updateFeed/:id', validateToken, authorizeRoles('Supplier'), updateFeed);
router.delete('/feed/deleteFeed/:id', validateToken, authorizeRoles('Supplier'), deleteFeed);

module.exports = router;