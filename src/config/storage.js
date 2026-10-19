const { Storage } = require('@google-cloud/storage');

// As credenciais são lidas de GOOGLE_APPLICATION_CREDENTIALS (caminho do JSON)
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;

module.exports = { storage, bucketName };
