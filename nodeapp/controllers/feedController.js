const Feed = require('../models/feedModel');
const Request = require('../models/requestModel');
async function getAllFeeds(req, res) {
  try {
    let query = Feed.find({});
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    const feeds = await query;
    return res.status(200).json(feeds);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getFeedById(req, res) {
  try {
    const { id } = req.params;
    let query = Feed.findById(id);
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    const feed = await query;
    
    if (!feed) {
      return res.status(404).json({ message: `Cannot find any feed with ID ${id}` });
    }
    
    return res.status(200).json(feed);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function addFeed(req, res) {
  try {
    const feedData = { ...req.body };
    
    if (req.user?.userId) {
      feedData.supplierId = req.user.userId;
    }

    const feed = await Feed.create(feedData);

    return res.status(200).json({ message: 'Feed Added Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateFeed(req, res) {
  try {
    const { id } = req.params;
    const { feedName, type, description, unit, pricePerUnit, availableUnits } = req.body;

    const feed = await Feed.findByIdAndUpdate(
      id,
      { feedName, type, description, unit, pricePerUnit, availableUnits },
      { new: true, runValidators: true }
    );

    if (!feed) {
      return res.status(404).json({ message: `Cannot find any feed with ID ${id}` });
    }

    return res.status(200).json({ message: 'Feed Updated Successfully', feed });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// controllers/feedController.js 
async function deleteFeed(req, res) {
  try {
    const { id } = req.params;
    
    // Check for pending requests
    const pendingRequests = await Request.find({
      itemType: 'Feed',
      itemId: id,
      status: 'Pending'
    });

    if (pendingRequests.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete feed. There are pending requests for this feed.' 
      });
    }

    const feed = await Feed.findByIdAndDelete(id);

    if (!feed) {
      return res.status(404).json({ message: `Cannot find any feed with ID ${id}` });
    }

    return res.status(200).json({ message: 'Feed Deleted Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getSupplierFeeds(req, res) {
  try {
    const supplierId = req.user.userId;
    let query = Feed.find({ supplierId });
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    const feeds = await query;
    return res.status(200).json(feeds);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllFeeds,
  getSupplierFeeds,
  getFeedById,
  addFeed,
  updateFeed,
  deleteFeed
};