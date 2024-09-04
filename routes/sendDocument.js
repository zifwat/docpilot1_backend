const router = require("express").Router();
const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const { analyzeDocument } = require("./extractText");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const connStr = process.env.CONNECTION_STRING;
const containerName = process.env.CONTAINER_NAME;
const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Get all blobs
router.get("/", async (req, res) => {
  let arrayOfblobs = [];

  let blobs = containerClient.listBlobsFlat();
  for await (const blob of blobs) {
    arrayOfblobs.push(blob.name);
  }

  
  console.log(arrayOfblobs);
  res.send(arrayOfblobs);
});

// Upload a blob
router.post("/", upload.single("input"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file received");
      res.status(400).send("No file received");
      return;
    }

    console.log(`File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Use the file name as the blob name
    const blobName = req.file.originalname;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the file to Azure Blob Storage
    const uploadBlobResponse = await blockBlobClient.upload(
      req.file.buffer,
      req.file.size
    );
    
    console.log(
      `Upload block blob ${blobName} successfully`,
      uploadBlobResponse.requestId
    );

    // Analyze the document
    var cleanedData = await analyzeDocument(blobName, req.body.fileType); 
    res.status(200).send(cleanedData);
    console.log(cleanedData);
  } catch (error) {
    console.error("Error uploading file to Azure Blob Storage:");
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
