const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1 } = require('uuid'); // We can just use Date.now() if uuid isn't installed. Let's use standard naming or crypto

// Let's rely on standard crypto and Path module for simpler naming
const path = require('path');
const crypto = require('crypto');

const containerName = 'user-photos';

async function uploadToAzure(fileBuffer, originalName) {
  // Get connection string from environment variables
  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Azure Storage Connection string not found");
  }

  // Create the BlobServiceClient object with connection string
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  // Ensure the container exists (optional but good practice)
  // await containerClient.createIfNotExists({ access: 'container' });

  // Create a unique name for the blob
  const extension = path.extname(originalName);
  const randomIdentifier = crypto.randomBytes(16).toString('hex');
  const blobName = `${randomIdentifier}${extension}`;

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload data to the blob
  const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer);
  
  // Return the public URL to the blob
  return blockBlobClient.url;
}

module.exports = { uploadToAzure };
