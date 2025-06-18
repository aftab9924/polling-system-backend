import express from 'express';
import { getAllPolls } from '../controllers/pollController.js';

const router = express.Router();

router.get('/', getAllPolls);

export default router;

