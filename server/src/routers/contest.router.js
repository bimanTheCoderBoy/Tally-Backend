
import express from 'express';
import { getAllContests, getContestById, createContest, joinContest,submitContest } from '../controllers/contest.controller.js';


const router = express.Router();

router.get('/all', getAllContests);

router.get('/:id', getContestById);

router.post('/add', createContest);

router.post('/:id/join', joinContest);

router.post('/submit', submitContest);


export default router;
