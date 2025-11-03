const Feedback = require('../models/feedbackModel');
const Feed = require('../models/feedModel');
const Medicine = require('../models/medicineModel');

async function getAllFeedbacksBySupplier(req, res) {
  try {
    const supplierId = req.user.userId;
    let query = Feedback.find({ supplierId, isDeleted: false });
    if (typeof query.populate === 'function') {
      query = query.populate('ownerId', 'userName email')
                   .populate('itemId');
    }
    const feedbacks = await query;
    return res.status(200).json(feedbacks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getFeedbacksByOwnerId(req, res) {
  try {
    const ownerId = req.user.userId;
    let query = Feedback.find({ ownerId, isDeleted: false });
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email')
                   .populate('itemId');
    }
    const feedbacks = await query;
    return res.status(200).json(feedbacks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

//controllers/feedbackController.js 
async function addFeedback(req, res) {
  try {
    const { title, description, category, rating, itemId, supplierId } = req.body;
    const ownerId = req.user.userId;

    // Get item to store name
    let item;
    if (category === 'Feed') {
      item = await Feed.findById(itemId);
    } else {
      item = await Medicine.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({ message: `${category} not found` });
    }

    const itemName = category === 'Feed' ? item.feedName : item.medicineName;

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      ownerId,
      itemId,
      category,
      isDeleted: false
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback for this item' });
    }

    const feedback = await Feedback.create({
      title,
      description,
      category,
      rating,
      itemId,
      itemName,
      supplierId,
      ownerId
    });

    return res.status(200).json({ message: 'Feedback Submitted Successfully', feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted feedback for this item' });
    }
    return res.status(500).json({ message: err.message });
  }
}

async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(
      id
    );

    if (!feedback) {
      return res.status(404).json({ message: `Cannot find any feedback with ID ${id}` });
    }

    return res.status(200).json({ message: 'Feedback Deleted Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllFeedbacksBySupplier,
  getFeedbacksByOwnerId,
  addFeedback,
  deleteFeedback
};