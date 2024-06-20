"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Email_1 = __importDefault(require("../models/Email")); // Correct import without .ts extension
const router = (0, express_1.Router)();
// POST route to add emails with consent check
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, aiSystem, riskManagement, consent } = req.body;
    if (!consent) {
        return res.status(400).send('Consent is required.');
    }
    const newEmail = new Email_1.default({ email, aiSystem, riskManagement, consent });
    try {
        yield newEmail.save();
        res.status(201).json({ message: 'Email saved successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// GDPR compliance: Data access
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emails = yield Email_1.default.find();
        res.status(200).json(emails);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Helper function to find email by comparison
const findEmailByEmail = (emailToFind) => __awaiter(void 0, void 0, void 0, function* () {
    const emails = yield Email_1.default.find();
    for (const email of emails) {
        if (yield email.compareEmail(emailToFind)) {
            return email;
        }
    }
    return null;
});
// GDPR compliance: Access specific email data
router.get('/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield findEmailByEmail(req.params.email);
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }
        res.status(200).json({ aiSystem: email.aiSystem, riskManagement: email.riskManagement });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// GDPR compliance: Data modification
router.put('/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield findEmailByEmail(req.params.email);
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }
        const updatedEmail = yield Email_1.default.findByIdAndUpdate(email._id, req.body, { new: true });
        res.status(200).json(updatedEmail);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// GDPR compliance: Data deletion
router.delete('/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = yield findEmailByEmail(req.params.email);
        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }
        yield Email_1.default.findByIdAndDelete(email._id);
        res.status(200).json({ message: 'Email deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Route to delete all entries
router.delete('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Email_1.default.deleteMany({});
        res.status(200).json({ message: 'All entries deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
