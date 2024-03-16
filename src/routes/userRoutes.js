import { Router } from 'express';
import { createUser, authenticateUser } from '../services/userService.js';

const router = Router();

// SignUp
router.post('/signup', async (req, res) => {
    try {
      const { fullName, email, password } = req.body;
      await createUser(fullName, email, password);
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email already exists.' });
      }
      res.status(500).json({ message: error.message });
    }
  });

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authenticateUser(email, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

export default router;
