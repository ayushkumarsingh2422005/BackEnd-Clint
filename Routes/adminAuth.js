// routes/userRoutes.js
import { Router } from 'express';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

const router = Router();

router.post('/auth', (req, res) => {
    const id = req.headers['id'];
    const pass = req.headers['pass'];

    const envId = process.env.ID;
    const envPass = process.env.PASS;
    if (id === envId && pass === envPass) {
        res.json({ "message": "Authentication successful"});
    } else {
        res.status(401).json({ "message": "Authentication failed"});
    }
});

export default router;
