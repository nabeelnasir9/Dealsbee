import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

router.post('/blogs', async (req, res) => {
  const { title, content, summary, author, imageUrl } = req.body;

  const newBlog = new Blog({
    title,
    content,
    summary,
    author: author || 'Dealsbajar',
    imageUrl
  });
  // console.log("Generated Slug:", newBlog.slug);

  try {
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    console.error('Error saving blog:', err);
    res.status(400).json({ message: err.message });
  }
});

router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.get('/blog/:id', async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);
//     if (!blog) return res.status(404).json({ message: "Blog not found" });
//     res.json(blog);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get('/blog/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;