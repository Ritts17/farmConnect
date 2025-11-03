const express = require('express');
const { validateToken, authorizeRoles } = require('../authUtils');
const { 
  getAllMedicines, 
  getMedicineById, 
  addMedicine, 
  updateMedicine, 
  deleteMedicine, 
  getSupplierMedicines
} = require('../controllers/medicineController');

const router = express.Router();

// Public routes - Anyone can view medicines
router.get('/medicine/getAllMedicines', getAllMedicines);
router.get('/medicine/getMedicineById/:id', getMedicineById);

// Supplier-only routes
router.get('/medicine/supplier/my-medicines', validateToken, authorizeRoles('Supplier'), getSupplierMedicines);
router.post('/medicine/addMedicine', validateToken, authorizeRoles('Supplier'), addMedicine);
router.put('/medicine/updateMedicine/:id', validateToken, authorizeRoles('Supplier'), updateMedicine);
router.delete('/medicine/deleteMedicine/:id', validateToken, authorizeRoles('Supplier'), deleteMedicine);

module.exports = router;