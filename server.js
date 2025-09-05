
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import morgan from 'morgan';

dotenv.config()

import {runMigration} from './config/database.js'

import healthHandler from './routes/health.js'
import authHandler from './routes/auth.js'
import chatbootHandler from './routes/chatboot.js'


const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

runMigration()

app.use('/status', healthHandler);
app.use('/chat', chatbootHandler)
app.use('/auth', authHandler);



app.use((req, res) => {
  res.status(404).send('Not Found');
});

const APP_PORT = process.env.APP_PORT || 3000

app.listen(APP_PORT, () => {
  console.log(`Server running at http://localhost:${APP_PORT}`);
});
