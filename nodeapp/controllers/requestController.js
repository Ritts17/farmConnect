const Request = require('../models/requestModel.js');
const Feed = require('../models/feedModel');
const Medicine = require('../models/medicineModel');

async function getAllRequestsBySupplier(req, res) {
  try {
    const supplierId = req.user.userId;
    
    // Get all feed and medicine IDs for this supplier
    const feeds = await Feed.find({ supplierId }).select('_id');
    const medicines = await Medicine.find({ supplierId }).select('_id');
    
    const feedIds = feeds.map(f => f._id);
    const medicineIds = medicines.map(m => m._id);
    
    const requests = await Request.find({
      $or: [
        { itemType: 'Feed', itemId: { $in: feedIds } },
        { itemType: 'Medicine', itemId: { $in: medicineIds } }
      ]
    })
      .populate('itemId')
      .populate('ownerId', 'userName email')
      
    return res.status(200).json(requests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getRequestsByOwnerId(req, res) {
  try {
    const ownerId = req.user.userId;
    const requests = await Request.find({ ownerId })
      .populate('itemId')
    return res.status(200).json(requests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// BACKEND: controllers/requestController.js - UPDATE addRequest
async function addRequest(req, res) {
  try {
    const { itemType, itemId, itemName, livestockName, quantity } = req.body;
    const ownerId = req.user.userId;

    // Check available units
    let item;
    if (itemType === 'Feed') {
      item = await Feed.findById(itemId);
    } else if (itemType === 'Medicine') {
      item = await Medicine.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({ message: `${itemType} not found` });
    }

    if (item.availableUnits < quantity) {
      return res.status(400).json({ 
        message: `Insufficient units available. Only ${item.availableUnits} units available.` 
      });
    }

    // const itemName = itemType === 'Feed' ? item.feedName : item.medicineName;

    const request = await Request.create({
      itemType,
      itemId,
      itemName,
      ownerId,
      livestockName,
      quantity
    });

    return res.status(200).json({ message: 'Request Created Successfully', request });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findById(id).populate('itemId');
    
    if (!request) {
      return res.status(404).json({ message: `Cannot find any request with ID ${id}` });
    }

    // If approving, reduce available units
    if (status === 'Approved' && request.status === 'Pending') {
      const Model = request.itemType === 'Feed' ? Feed : Medicine;
      const item = await Model.findById(request.itemId);
      
      if (item.availableUnits < request.quantity) {
        return res.status(400).json({ 
          message: `Insufficient units available. Only ${item.availableUnits} units available.` 
        });
      }
      
      item.availableUnits -= request.quantity;
      await item.save();
    }

    request.status = status;
    await request.save();

    return res.status(200).json({ message: 'Request Status Updated Successfully', request });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function deleteRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await Request.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({ message: `Cannot find any request with ID ${id}` });
    }

    return res.status(200).json({ message: 'Request Deleted Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllRequestsBySupplier,
  getRequestsByOwnerId,
  addRequest,
  updateRequestStatus,
  deleteRequest
};