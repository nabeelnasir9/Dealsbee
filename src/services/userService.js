// import bcrypt from 'bcryptjs';
// const { hash, compare } = bcrypt;
// import { sign } from 'jsonwebtoken';
// import User from '../models/User.js';

// const createUser = async (username, password) => {
//   const hashedPassword = await hash(password, 10);
//   const newUser = new User({ username, password: hashedPassword });
//   await newUser.save();
//   return newUser;
// };

// const authenticateUser = async (username, password) => {
//   const user = await findOne({ username });
//   if (!user || !(await compare(password, user.password))) {
//     throw new Error('Invalid credentials');
//   }
//   const token = sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   return token;
// };

// export default { createUser, authenticateUser };


import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Adjusted for clarity and consistency
import User from '../models/User.js'; // Remove { findOne } from the import

export const createUser = async (username, password)  => {
  const hashedPassword = await bcrypt.hash(password, 10); // Use bcrypt directly
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  return newUser;
};

export const authenticateUser = async (username, password)  => {
  // Use User model directly to call findOne
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) { // Use bcrypt directly
    throw new Error('Invalid credentials');
  }
  // Ensure you've set process.env.JWT_SECRET somewhere in your configuration or environment
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Use jwt directly
  return token;
};

// export default userService;
