const fs = require('fs');
const cron = require('node-cron');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();
const multer = require('multer');

const app = express();
const port = process.env.PORT || 8080;


// Directory for cached images
const cacheFolder = path.join(__dirname, 'cached_images');

// Create the cache folder for storing images if it doesn’t exist
if (!fs.existsSync(cacheFolder)) {
    fs.mkdirSync(cacheFolder);
}

// Azure Blob Storage configuration
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// helper to get a list of local cached images
function getLocalImages() {
    return new Promise((resolve, reject) => {
        fs.readdir(cacheFolder, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });
}

// Function to cache images from Azure Blob Storage with logging
async function cacheImagesFromAzure() {
    console.log('Starting selective image cache from Azure...');

    try {
        const containerClient = blobServiceClient.getContainerClient('images');
        
        // retrieve list of existing local files
        const localFiles = await getLocalImages();
        
        for await (const blob of containerClient.listBlobsFlat()) {
            const blobName = blob.name;
            
            // check if this blob already exists locally
            if (!localFiles.includes(blobName)) {
                console.log(`Caching new image: ${blobName}`);
                const blobClient = containerClient.getBlobClient(blobName);
                const downloadBlockBlobResponse = await blobClient.download(0);
                const filePath = path.join(cacheFolder, blobName);

                // download and save the new file
                const writableStream = fs.createWriteStream(filePath);
                await new Promise((resolve, reject) => {
                    downloadBlockBlobResponse.readableStreamBody
                        .pipe(writableStream)
                        .on('finish', () => {
                            console.log(`Successfully cached: ${blobName}`);
                            resolve();
                        })
                        .on('error', (err) => {
                            console.error(`Error caching ${blobName}:`, err);
                            reject(err);
                        });
                });
            } else {
                console.log(`Image ${blobName} already cached locally`);
            }
        }

        console.log('Selective image cache from Azure completed successfully.');
    } catch (error) {
        console.error('Error during selective caching from Azure:', error);
    }
}

// Middleware to parse JSON
app.use(express.json());

// Session configuration
app.use(
    session({
        secret: 'super-secret-key', // Replace with environment variable in production
        resave: false,
        saveUninitialized: true,
    })
);

// Serve React files
app.use(express.static(path.join(__dirname, 'client', 'build')));




// Login route with hardcoded credentials
app.post('/login', (req, res) => {
    console.log('Login route hit with:', req.body);
    const { username, password } = req.body;

    if (username === 'admin' && password === 'password123') {
        req.session.isAdmin = true;
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to upload images to Azure Blob Storage
app.post('/upload', upload.single('image'), async (req, res) => {
    console.log('Upload route hit with:', req.file);
    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }

    try {
        const containerClient = blobServiceClient.getContainerClient('images');
        const blobName = req.file.filename;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadFile(req.file.path);

        res.status(200).send('Image uploaded to Azure successfully!');
    } catch (error) {
        console.error('Error uploading to Azure:', error);
        res.status(500).send('Error uploading to Azure');
    }
});

// Route to get a random cached image
app.get('/local-images', (req, res) => {
    fs.readdir(cacheFolder, (err, files) => {
        if (err || files.length === 0) {
            return res.status(404).send('No cached images available');
        }

        const randomIndex = Math.floor(Math.random() * files.length);
        const randomImage = files[randomIndex];
        res.sendFile(path.join(cacheFolder, randomImage));
    });
});

// Route to manually refresh the cache with logging
app.get('/refresh-images', async (req, res) => {
    console.log('Manual cache refresh requested at /refresh-images');
    try {
        await cacheImagesFromAzure();
        res.send('Images refreshed from Azure successfully!');
    } catch (error) {
        console.error('Error during manual cache refresh:', error);
        res.status(500).send('Error refreshing images');
    }
});

// Schedule automatic caching at midnight
cron.schedule('0 0 * * *', cacheImagesFromAzure); 


// Test route to check server status
app.get('/test', (req, res) => {
    console.log(`Test route hit with method: ${req.method} and URL: ${req.url}`);
    res.send('Test route working!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// catch-all route to serve React for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});