const Medicine = require('../models/medicineModel');
const Request = require('../models/requestModel');

async function getAllMedicines(req, res) {
  try {
    let query = Medicine.find({});
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    const medicines = await query;
    return res.status(200).json(medicines);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getMedicineById(req, res) {
  try {
    const { id } = req.params;
    let query = Medicine.findById(id);
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    const medicine = await query;
    
    if (!medicine) {
      return res.status(404).json({ message: `Cannot find any medicine with ID ${id}` });
    }
    
    return res.status(200).json(medicine);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function addMedicine(req, res) {
  try {
    const medicineData = { ...req.body };
    
    if (req.user?.userId) {
      medicineData.supplierId = req.user.userId;
    }

    const medicine = await Medicine.create(medicineData);

    return res.status(200).json({ message: 'Medicine Added Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateMedicine(req, res) {
  try {
    const { id } = req.params;
    const { medicineName, type, description, dosage, pricePerUnit, unit, manufacturer, expiryDate, availableUnits } = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      id,
      { medicineName, type, description, dosage, pricePerUnit, unit, manufacturer, expiryDate, availableUnits },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: `Cannot find any medicine with ID ${id}` });
    }

    return res.status(200).json({ message: 'Medicine Updated Successfully', medicine });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// BACKEND: controllers/medicineController.js - UPDATE deleteMedicine
async function deleteMedicine(req, res) {
  console.log("Delete medicine: ", req.body);
  try {
    const { id } = req.params;
    
    // Check for pending requests
    const pendingRequests = await Request.find({
      itemType: 'Medicine',
      itemId: id,
      status: 'Pending'
    });

    if (pendingRequests.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete medicine. There are pending requests for this medicine.' 
      });
    }

    const medicine = await Medicine.findByIdAndDelete(id);

    if (!medicine) {
      return res.status(404).json({ message: `Cannot find any medicine with ID ${id}` });
    }

    return res.status(200).json({ message: 'Medicine Deleted Successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getSupplierMedicines(req, res) {
  try {
    const supplierId = req.user.userId;
    let query = Medicine.find({ supplierId });
    if (typeof query.populate === 'function') {
      query = query.populate('supplierId', 'userName email');
    }
    const medicines = await query;
    return res.status(200).json(medicines);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// Export this new function
module.exports = {
  getAllMedicines,
  getSupplierMedicines, // ADD THIS
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine
};