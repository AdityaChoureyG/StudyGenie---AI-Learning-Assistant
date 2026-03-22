import express from 'express';
import { getDeshboard } from '../controllers/progressController.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect); // protect all routes

router.get('/dashboard', getDeshboard);

export default router;