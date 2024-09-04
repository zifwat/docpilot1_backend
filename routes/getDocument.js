const router = require("express").Router();
const { BlobServiceClient } = require("@azure/storage-blob");


const connStr = process.env.CONNECTION_STRING;

const containerName = process.env.CONTAINER_NAME;
const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
const containerClient = blobServiceClient.getContainerClient(containerName);
router.get("/", async (req, res) => {
  let arrayOfblobs = [];

  let blobs = containerClient.listBlobsFlat();
  for await (const blob of blobs) {
    arrayOfblobs.push(blob.name);
  }

  console.log(arrayOfblobs);
  res.send(arrayOfblobs);
});

module.exports = router;
