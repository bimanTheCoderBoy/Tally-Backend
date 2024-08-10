import express from 'express';
import { getAllQuestions, addQuestion, getQuestionById,runTestCase } from '../controllers/question.controller.js';

const router = express.Router();

router.get('/all', getAllQuestions);

router.get('/:id', getQuestionById);

router.post('/add', addQuestion);
router.post('/run/:id',runTestCase );

export default router;
