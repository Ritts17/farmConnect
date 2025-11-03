const Livestock = require('../models/liveStockModel');

async function getAllLivestock(req, res) {
  try {
    let query = Livestock.find({});
    if (typeof query.populate === 'function') {
      query = query.populate('userId', 'userName email');
    }
    const livestock = await query;
    return res.status(200).json(livestock);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getLivestockById(req, res) {
  try {
    const { id } = req.params;
    let query = Livestock.findById(id);
    
    if (typeof query.populate === 'function') {
      query = query.populate('userId', 'userName email');
    }
    const livestock = await query;
    
    if (!livestock) {
      return res.status(404).json({ message: `Cannot find any livestock with ID ${id}` });
    }
    
    return res.status(200).json(livestock);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function addLivestock(req, res) {
  try {
    const livestockData = { ...req.body };
    
    // Add userId if req.user exists (for real requests)
    if (req.user?.userId) {
      livestockData.userId = req.user.userId;
    }
    
    if (req.file) {
      livestockData.attachment = `/uploads/livestock/${req.file.filename}`;
    }

    const livestock = await Livestock.create(livestockData);

    return res.status(200).json({ message: 'Livestock Added Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateLivestock(req, res) {
  try {
    const { id } = req.params;
    const { name, species, age, breed, healthCondition, location, vaccinationStatus } = req.body;
    
    const updateData = {
      name,
      species,
      age,
      breed,
      healthCondition,
      location,
      vaccinationStatus
    };

    if (req.file) {
      updateData.attachment = `/uploads/livestock/${req.file.filename}`;
    }

    const livestock = await Livestock.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!livestock) {
      return res.status(404).json({ message: `Cannot find any livestock with ID ${id}` });
    }

    return res.status(200).json({ message: 'Livestock Updated Successfully', livestock });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function deleteLivestock(req, res) {
  try {
    const { id } = req.params;
    const livestock = await Livestock.findByIdAndDelete(id);

    if (!livestock) {
      return res.status(404).json({ message: `Cannot find any livestock with ID ${id}` });
    }

    return res.status(200).json({ message: 'Livestock Deleted Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getLivestockByOwnerId(req, res) {
  try {
    const ownerId = req.user.userId;
    let query = Livestock.find({ userId: ownerId });
    if (typeof query.populate === 'function') {
      query = query.populate('userId', 'userName email');
    }
    const livestock = await query;
    return res.status(200).json(livestock);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllLivestock,
  getLivestockById,
  getLivestockByOwnerId,
  addLivestock,
  updateLivestock,
  deleteLivestock
};
