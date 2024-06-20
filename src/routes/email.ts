import { Router } from 'express';
import Email from '../models/Email'; // Correct import without .ts extension

const router = Router();

// POST route to add emails with consent check
router.post('/', async (req, res) => {
  const { email, aiSystem, riskManagement, consent } = req.body;
  if (!consent) {
    return res.status(400).send('Consent is required.');
  }

  const newEmail = new Email({ email, aiSystem, riskManagement, consent });
  try {
    await newEmail.save();
    res.status(201).json({ message: 'Email saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GDPR compliance: Data access
router.get('/', async (req, res) => {
  try {
    const emails = await Email.find();
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to find email by comparison
const findEmailByEmail = async (emailToFind: string) => {
  const emails = await Email.find();
  for (const email of emails) {
    if (await email.compareEmail(emailToFind)) {
      return email;
    }
  }
  return null;
};

// GDPR compliance: Access specific email data
router.get('/:email', async (req, res) => {
  try {
    const email = await findEmailByEmail(req.params.email);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.status(200).json({ aiSystem: email.aiSystem, riskManagement: email.riskManagement });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GDPR compliance: Data modification
router.put('/:email', async (req, res) => {
  try {
    const email = await findEmailByEmail(req.params.email);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    const updatedEmail = await Email.findByIdAndUpdate(
      email._id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedEmail);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GDPR compliance: Data deletion
router.delete('/:email', async (req, res) => {
  try {
    const email = await findEmailByEmail(req.params.email);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    await Email.findByIdAndDelete(email._id);
    res.status(200).json({ message: 'Email deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to delete all entries
router.delete('/all', async (req, res) => {
  try {
    await Email.deleteMany({});
    res.status(200).json({ message: 'All entries deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
