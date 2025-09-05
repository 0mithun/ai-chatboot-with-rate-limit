// routes/users.js
import express from 'express'
import rateLimitMiddleware from '../middleware/rateLimitter.js';

const router = express.Router();

router.get('/chatboot', rateLimitMiddleware, (req, res)=> {
  console.log("chat boot handler")

  res.send("chatboot response")
})
export default router;