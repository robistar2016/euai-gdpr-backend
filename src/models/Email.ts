import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IEmail extends Document {
  email: string;
  aiSystem: string;
  riskManagement: string;
  consent: boolean;
  date: Date;
  compareEmail(candidateEmail: string): Promise<boolean>;
}

const emailSchema: Schema<IEmail> = new Schema({
  email: { type: String, required: true },
  aiSystem: { type: String, required: true },
  riskManagement: { type: String, required: true },
  consent: { type: Boolean, required: true },
  date: { type: Date, default: Date.now },
});

// Middleware to hash email before saving
emailSchema.pre<IEmail>('save', async function (next) {
  if (this.isModified('email')) {
    const salt = await bcrypt.genSalt(10);
    this.email = await bcrypt.hash(this.email, salt);
  }
  next();
});

// Method to compare emails
emailSchema.methods.compareEmail = async function (candidateEmail: string) {
  return await bcrypt.compare(candidateEmail, this.email);
};

const Email = mongoose.model<IEmail>('Email', emailSchema);

export default Email;
