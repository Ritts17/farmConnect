
const express = require('express');
const { authorizeRoles, validateToken } = require('../authUtils');
const { addLivestock, deleteLivestock, getAllLivestock, getLivestockById, updateLivestock, getLivestockByOwnerId } = require('../controllers/liveStockController');
const upload = require('../middleware/upload');

const router = express.Router();

// Protected routes - Owner only
router.get('/livestock/getAllLivestock', validateToken, authorizeRoles('Owner'), getAllLivestock);
router.get('/livestock/getLivestockById/:id', validateToken, authorizeRoles('Owner'), getLivestockById);
router.post('/livestock/addLivestock', validateToken, authorizeRoles('Owner'), upload.single('attachment'), addLivestock);
router.put('/livestock/updateLivestock/:id', validateToken, authorizeRoles('Owner'), upload.single('attachment'), updateLivestock);
router.delete('/livestock/deleteLivestock/:id', validateToken, authorizeRoles('Owner'), deleteLivestock);
router.get('/livestock/owner/all', validateToken, authorizeRoles('Owner'), getLivestockByOwnerId);

module.exports = router;