const express = require('express');
const { authorizeRoles, validateToken } = require("../authUtils");
const { addRequest, deleteRequest, getAllRequestsBySupplier, getRequestsByOwnerId, updateRequestStatus } = require("../controllers/requestController");

const router = express.Router();

// Supplier can see all requests for their items
router.get('/request/supplier/all', validateToken, authorizeRoles('Supplier'), getAllRequestsBySupplier);
router.put('/request/updateRequestStatus/:id', validateToken, authorizeRoles('Supplier'), updateRequestStatus);

// Owner-specific routes
router.get('/request/owner/all', validateToken, authorizeRoles('Owner'), getRequestsByOwnerId);
router.post('/request/addRequest', validateToken, authorizeRoles('Owner'), addRequest);
router.delete('/request/deleteRequest/:id', validateToken, authorizeRoles('Owner'), deleteRequest);

module.exports = router;