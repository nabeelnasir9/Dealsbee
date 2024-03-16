import { Router } from 'express';
import { createUser, authenticateUser } from '../services/userService.js';

const router = Router();

// SignUp
router.post('/signup', async (req, res) => {
  try {
    await createUser(req.body.username, req.body.password);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const token = await authenticateUser(req.body.username, req.body.password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

export default router;
