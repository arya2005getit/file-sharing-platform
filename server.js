const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const File = require("./models/File.js");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const allowedTypes = new Set([
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "text/plain"
]);

const upload = multer({
  dest: "uploads",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error("Invalid file type. Upload a PDF, ZIP, DOCX, XLSX, PPTX, image, or text file."));
    }
    callback(null, true);
  }
});

app.get("/", (req, res) => {
  res.render("index", { success: null, error: null });
});

app.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).render("index", { success: null, error: "File size must be 10 MB or less." });
    }
    if (error) {
      return res.status(400).render("index", { success: null, error: error.message });
    }
    if (!req.file) {
      return res.status(400).render("index", { success: null, error: "Please select a file to upload." });
    }

    const password = (req.body.password || "").trim();
    if (!password) {
      req.file && req.file.path && require("fs").unlink(req.file.path, () => {});
      return res.status(400).render("index", { success: null, error: "Password is required and cannot be empty." });
    }
    if (password.length < 4 || password.length > 64) {
      req.file && req.file.path && require("fs").unlink(req.file.path, () => {});
      return res.status(400).render("index", { success: null, error: "Password must contain between 4 and 64 characters." });
    }

    try {
      const file = await File.create({
        path: req.file.path,
        originalName: req.file.originalname,
        password: await bcrypt.hash(password, 10)
      });

      const fileLink = `${req.protocol}://${req.get("host")}/file/${file.id}`;
      return res.status(201).render("index", {
        success: "File uploaded successfully.",
        fileLink,
        error: null
      });
    } catch (databaseError) {
      console.error(databaseError);
      req.file && req.file.path && require("fs").unlink(req.file.path, () => {});
      return res.status(500).render("index", { success: null, error: "The file could not be saved." });
    }
  });
});

app.get("/file/:id", handleDownload);
app.post("/file/:id", handleDownload);

async function handleDownload(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).render("password", { error: "Invalid file ID." });
  }

  let file;
  try {
    file = await File.findById(req.params.id);
  } catch (error) {
    return res.status(404).render("password", { error: "File not found." });
  }

  if (!file) {
    return res.status(404).render("password", { error: "File not found." });
  }

  if (req.method === "GET" || !req.body.password) {
    return res.render("password", { error: null });
  }

  const password = req.body.password.trim();
  if (!password) {
    return res.status(400).render("password", { error: "Password is required." });
  }

  if (!(await bcrypt.compare(password, file.password))) {
    return res.status(401).render("password", { error: "Incorrect password." });
  }

  file.downloadCount += 1;
  await file.save();
  return res.download(file.path, file.originalName);
}

app.use((req, res) => {
  res.status(404).render("password", { error: "Page not found." });
});

async function startServer() {
  if (!process.env.MONGO) {
    console.error("MONGO is required. Add it to the environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO);
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`File Sharing application running on port ${port}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
