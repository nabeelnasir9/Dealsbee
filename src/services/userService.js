import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import User from '../models/User.js';

export const createUser = async (username, password)  => {
  const hashedPassword = await bcrypt.hash(password, 10); 
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  return newUser;
};

export const authenticateUser = async (username, password)  => {
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

