const multer = require("multer");
const path = require("path");
const fs = require('fs');

const storage = multer.diskStorage({
  destination: "public/images",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const storageDocs = multer.diskStorage({
  destination: "public/docs",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const storageMultiple = multer.diskStorage({
  destination: function (req, file, cb) {
    var dir = 'public/images';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

const uploadSingle = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single("image");

const uploadDocument = multer({
  storage: storageDocs,
  fileFilter: function (req, file, cb) {
    checkDocsType(file, cb);
  }
}).single("document");

const uploadMultiple = multer({
  storage: storageMultiple,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array("image", 12);

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Images Only !!!");
  }
}

function checkDocsType(file, cb) {
  const fileTypes = /pdf|doc|docx/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: PDF or Docs Only !!!");
  }
}

module.exports = { uploadSingle, uploadMultiple, uploadDocument };