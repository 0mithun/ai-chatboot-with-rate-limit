// routes/users.js
import express from 'express'
import rateLimitMiddleware from '../middleware/rateLimitter.js';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const router = express.Router();

router.post('/', rateLimitMiddleware,  async (req, res)=> {
   try {
    const { messages } = req.body;

    // Validate the request body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Use streamText to get a streaming response
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: messages,
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Security header

    for await (const textPart of result.textStream) {
      res.write(textPart);
    }

    res.end();

  } catch (error) {
    console.error('Server-side error:', error);
    if (!res.headersSent) {
      res.status(500).send('An internal server error occurred.');
    } else {
      console.error('An error occurred after the response started streaming.');
    }
  }
})


export default router;