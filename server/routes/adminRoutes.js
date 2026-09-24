const express = require("express");

const {
  getAdminStats,
  getAdminPurchases,
   getAdminUsers,
} = require("../controllers/adminController");


const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin statistics
router.get(
  "/stats",
  protect,
  adminOnly,
  getAdminStats
  
);

// Admin purchases
router.get(
  "/purchases",
  protect,
  adminOnly,
  getAdminPurchases
);
router.get(
  "/users",
  protect,
  adminOnly,
  getAdminUsers
);

module.exports = router;