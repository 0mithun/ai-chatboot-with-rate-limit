import jwt from 'jsonwebtoken'

import dotenv from 'dotenv'
dotenv.config()

const rateLimitWindowMs = 1000 * 60  * 60; // 1 hour
const userTiers = {
  guest: { limit: 3 },
  free: { limit: 10 },
  premium: { limit: 50 },
};

const requestTracker = {};
const JWT_SECRET = process.env.JWT_SECRET


const rateLimitMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  const ip = req.socket.remoteAddress;
  const currentTime = Date.now();
  let userId;
  let userTier;


  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      userId = decoded.userId;
      userTier = userTiers[decoded.plan] || userTiers.guest;
    } catch (err) {
      userId = ip;
      userTier = userTiers.guest;
    }
  } else {
    userId = ip;
    userTier = userTiers.guest;
  }

  if (!requestTracker[userId]) {
    requestTracker[userId] = { count: 1, startTime: currentTime };
  } else {
    const windowData = requestTracker[userId];
    const timePassed = currentTime - windowData.startTime;
    if (timePassed < rateLimitWindowMs) {
      windowData.count++;
    } else {
      windowData.count = 1;
      windowData.startTime = currentTime;
    }
  }

  if (requestTracker[userId].count > userTier.limit) {
    return res.status(429).send(`Too many requests. Limit is ${userTier.limit} per minute.`);
  }

  next();
};


export default rateLimitMiddleware