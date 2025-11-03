const express = require('express');
const { validateToken, authorizeRoles } = require('../authUtils');
const { 
  getAllFeedbacksBySupplier,
  getFeedbacksByOwnerId,
  addFeedback, 
  deleteFeedback 
} = require('../controllers/feedbackController');

const router = express.Router();

// Supplier can view all feedbacks for their items
router.get('/feedback/supplier/all', validateToken, authorizeRoles('Supplier'), getAllFeedbacksBySupplier);

// Owner can view and manage their feedbacks
router.get('/feedback/owner/all', validateToken, authorizeRoles('Owner'), getFeedbacksByOwnerId);
router.post('/feedback/addFeedback', validateToken, authorizeRoles('Owner'), addFeedback);
router.delete('/feedback/deleteFeedback/:id', validateToken, authorizeRoles('Owner'), deleteFeedback);

module.exports = router;