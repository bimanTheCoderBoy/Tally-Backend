import express from 'express';
import { getAllQuestions, addQuestion, getQuestionById } from '../controllers/question.controller.js';

const router = express.Router();

router.get('/all', getAllQuestions);

router.get('/:id', getQuestionById);

router.post('/add', addQuestion);

export default router;
