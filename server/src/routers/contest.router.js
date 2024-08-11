
import express from 'express';
import { getAllContests, getContestById, createContest, joinContest, submitContest, getUser,getLeaderboard } from '../controllers/contest.controller.js';


const router = express.Router();

router.get('/all', getAllContests);

router.get('/get/:contestcode', getContestById);

router.post('/add', createContest);

router.post('/join', joinContest);

router.post('/submit/:qid', submitContest);

router.get('/getuser', getUser);
router.get('getleaderboard/:contestcode', getLeaderboard);


export default router;
