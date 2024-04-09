import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

router.post('/blogs', async (req, res) => {
    const { title, content, summary, author } = req.body;
  
    // Create a new blog post using the request's body
    const newBlog = new Blog({
      title,
      content,
      summary,
      author: author || 'Dealsbajar',
    });
  
    try {
      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// Get all blogs
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific blog
router.get('/blog/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
