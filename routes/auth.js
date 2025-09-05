
import express from 'express'
import bcrypt from 'bcryptjs'
import Joi from 'joi';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import connection from '../config/database.js'
import authMiddleware from './../middleware/auth.js'

dotenv.config()

const router = express.Router();
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  plan: Joi.string().valid('free', 'premium').required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});


router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        message: error.message,
        status: false
      })
    };
    
    const { email, password, plan } = value;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await connection.query(
      'INSERT INTO users (email, password, plan) VALUES ($1, $2, $3) RETURNING id, email, created_at',
      [email, hashedPassword, plan]
    );
    
    const user = result.rows[0];
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});


router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(422).json({
        message: error.message,
        status: false
      })
    };
    
    const { email, password } = value;
    
    const result = await connection.query(
      'SELECT id, email, plan, password FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, plan: user.plan, }, process.env.JWT_SECRET, { expiresIn: Number(process.env.JWT_EXPIRES_IN || 3600) });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authMiddleware,  (req, res)=> {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    // Sending success response
    res.status(200).json({ message: "Logged out successfully", status: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})



export default router;