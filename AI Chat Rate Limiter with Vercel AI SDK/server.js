
import express from 'express'
import dotenv from 'dotenv'
import {runMigration} from './config/database.js'

import healthHandler from './routes/health.js'
import authHandler from './routes/auth.js'
import chatbootHandler from './routes/chatboot.js'

dotenv.config()
const app = express();
runMigration()
// Parse URL-encoded bodies for the /login route
app.use(express.json());


app.use('/health', healthHandler);
app.use('/auth', authHandler);
app.use('/chatboot', chatbootHandler)


app.use((req, res) => {
  res.status(404).send('Not Found');
});


const APP_PORT = process.env.APP_PORT || 3000

app.listen(APP_PORT, () => {
  console.log(`Server running at http://localhost:${APP_PORT}`);
});
