"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const email_1 = __importDefault(require("./routes/email"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use((0, morgan_1.default)('combined')); // Add morgan middleware for logging
// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/mydatabase';
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error: ', err));
// Routes
app.use('/api/emails', email_1.default);
// Load SSL certificates
const privateKey = fs_1.default.readFileSync(path_1.default.join(__dirname, '../ssl/key.pem'), 'utf8');
const certificate = fs_1.default.readFileSync(path_1.default.join(__dirname, '../ssl/cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };
// Create HTTPS server
const httpsServer = https_1.default.createServer(credentials, app);
// Start HTTPS server
httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server is running on https://localhost:${PORT}`);
});
// Optionally, redirect HTTP to HTTPS
const httpApp = (0, express_1.default)();
httpApp.get('*', (req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
});
const HTTP_PORT = 8080;
httpApp.listen(HTTP_PORT, () => {
    console.log(`HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`);
});
