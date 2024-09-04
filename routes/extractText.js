const router = require("express").Router();
const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");
require('dotenv').config();

const cleanDocumentData = require('./cleanDocumentData'); 
const cleanInvoiceDocumentData = require('./cleanInvoiceDocumentData'); 

async function analyzeDocument(input, filetype) {
  if (!input || !filetype) {
    throw new Error("Missing required parameters: input and filetype");
  }
  
  const allowedFiletypes = ["Resume", "Invoice", "Card"];
  if (!allowedFiletypes.includes(filetype)) {
    throw new Error(`Invalid filetype. Allowed values: ${allowedFiletypes.join(", ")}`);
  }

  const defaultFileName = "https://xtractstore.blob.core.windows.net/dataset/";
  const fileURL = defaultFileName + input;

  const endpoint = process.env.ENDPOINT;
  const credential = new AzureKeyCredential(process.env.CREDENTIAL);
  const client = new DocumentAnalysisClient(endpoint, credential);

  let modelId;
  let cleanFunction;
  if(filetype === "Resume"){
    modelId = process.env.CVXTRACT_V1_MODEL_ID;
    cleanFunction = cleanDocumentData;
  } else if(filetype === "Invoice"){
    modelId = process.env.PREBUILT_INVOICE_MODEL_ID; 
    cleanFunction = cleanInvoiceDocumentData;
  } else if(filetype === "Card"){
    modelId = process.env.PREBUILT_BUSINESSCARD_MODEL_ID;
    cleanFunction = cleanDocumentData; 
  }
  
  try {
    const poller = await client.beginAnalyzeDocument(modelId, fileURL);
    const {
      documents: [document],
    } = await poller.pollUntilDone();
    if (!document) {
      throw new Error("Expected at least one document in the result.");
    }

    const cleanedData = cleanFunction(document);

    return cleanedData; 

  } catch (error) {
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}

module.exports = { analyzeDocument };