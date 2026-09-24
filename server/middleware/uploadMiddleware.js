const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "pdf") {
      cb(null, path.join(__dirname, "../uploads"));
    } else if (file.fieldname === "cover") {
      cb(null, path.join(__dirname, "../uploads/covers"));
    } else {
      cb(new Error("Invalid file field"));
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  // PDF
  if (
    file.fieldname === "pdf" &&
    extension === ".pdf"
  ) {
    return cb(null, true);
  }

  // Cover image
  const allowedImages = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  if (
    file.fieldname === "cover" &&
    allowedImages.includes(extension)
  ) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Invalid file type"
    )
  );
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

module.exports = upload;