const Book = require("../models/Book");
const User = require("../models/User");
const Purchase = require("../models/Purchase");

// ===============================
// ADMIN STATISTICS
// ===============================
const getAdminStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();

    const totalUsers = await User.countDocuments();

    const totalPurchases = await Purchase.countDocuments({
      paymentStatus: "paid",
    });

    const revenueResult = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    res.status(200).json({
      totalBooks,
      totalUsers,
      totalPurchases,
      totalRevenue,
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      message: "Unable to fetch admin statistics.",
    });
  }
};

// ===============================
// ADMIN PURCHASES
// ===============================
const getAdminPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      paymentStatus: "paid",
    })
      .populate("user", "name email")
      .populate("book", "title price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      purchases,
    });
  } catch (error) {
    console.error("Admin purchases error:", error);

    res.status(500).json({
      message: "Unable to fetch purchases.",
    });
  }
};
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "name email role createdAt"
    ).sort({ createdAt: -1 });

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(
      "Admin users error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch users.",
    });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  getAdminStats,
  getAdminPurchases,
   getAdminUsers,
};