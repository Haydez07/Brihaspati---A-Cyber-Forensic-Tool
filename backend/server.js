const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // ✅ Load environment variables

const connectDB = require("./config/db"); // ✅ Connect MongoDB
const contactRoutes = require("./routes/contact.route");
const {
  connectDevice,
  fetchImagePaths,
  downloadImage,
} = require("./adbHandler");


const app = express();
const PORT = process.env.PORT || 3000;
const TMP_DIR = path.join(__dirname, "temp");

// ✅ Ensure temp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}

// ✅ Connect to MongoDB
connectDB();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/contact", contactRoutes);

// === ADB ROUTES ===
app.get("/connect", async (req, res) => {
  try {
    const msg = await connectDevice();
    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/images", async (req, res) => {
  try {
    const paths = await fetchImagePaths();
    res.json({ success: true, images: paths });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/download", async (req, res) => {
  const filePath = req.query.file;
  if (!filePath) return res.status(400).send("Missing file parameter");

  try {
    const { localPath, filename } = await downloadImage(filePath);
    res.download(localPath, filename, () => {
      fs.unlink(localPath, () => {}); // delete after sending
    });
  } catch (err) {
    res.status(500).send("Download failed");
  }
});

app.get("/preview", async (req, res) => {
  const filePath = req.query.file;
  if (!filePath) return res.status(400).send("Missing file parameter");

  try {
    const { localPath } = await downloadImage(filePath);
    res.sendFile(localPath, () => {
      fs.unlink(localPath, () => {});
    });
  } catch (err) {
    res.status(500).send("Preview failed");
  }
});

// ✅ Clear temp files every 30 min
function clearTempFiles() {
  fs.readdir(TMP_DIR, (err, files) => {
    if (err) return;
    for (const file of files) {
      fs.unlink(path.join(TMP_DIR, file), () => {});
    }
  });
}
setInterval(clearTempFiles, 30 * 60 * 1000);
app.get("/image", async (req, res) => {
  const filePath = req.query.file;
  if (!filePath) return res.status(400).send("Missing file parameter");

  try {
    const { localPath } = await downloadImage(filePath);
    res.sendFile(localPath, () => {
      fs.unlink(localPath, () => {});
    });
  } catch (err) {
    res.status(500).send("Image route failed");
  }
});


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
