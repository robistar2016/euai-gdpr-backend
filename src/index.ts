import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import emailRoutes from './routes/email';
import dotenv from 'dotenv';
import morgan from 'morgan';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));  // Add morgan middleware for logging

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/mydatabase';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error: ', err));

// Routes
app.use('/api/emails', emailRoutes);

// Load SSL certificates
const privateKey = fs.readFileSync(path.join(__dirname, '../ssl/key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start HTTPS server
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${PORT}`);
});

// Optionally, redirect HTTP to HTTPS
const httpApp = express();
httpApp.get('*', (req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});
const HTTP_PORT = 8080;
httpApp.listen(HTTP_PORT, () => {
  console.log(`HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`);
});
