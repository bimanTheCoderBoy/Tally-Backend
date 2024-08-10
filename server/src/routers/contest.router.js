
import express from 'express';
import { getAllContests, getContestById, createContest, joinContest, submitContest, getUser } from '../controllers/contest.controller.js';


const router = express.Router();

router.get('/all', getAllContests);

router.get('/get', getContestById);

router.post('/add', createContest);

router.post('/join', joinContest);

router.post('/submit/:qid', submitContest);

router.get('/getuser', getUser);


export default router;
