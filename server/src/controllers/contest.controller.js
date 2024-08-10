
import mongoose from 'mongoose';
import Contest from '../models/Contest.model.js';
import AsyncHandler from "../utils/AsyncHandler.js"
import crypto from 'crypto';


// Get all ongoing contests
export const getAllContests = AsyncHandler(async (req, res) => {

  // Find contests where the end time is greater than or equal to the current date
  const contests = await Contest.find({ endTime: { $gte: new Date() } }).select('title startTime endTime');

  // Check if there are no ongoing contests
  if (contests.length === 0) {
    return res.status(404).json({ message: 'No ongoing contests found.' });
  }

  // Send the list of ongoing contests
  res.status(200).json(contests);
});


// Get a single contest by ID
export const getContestById = AsyncHandler(async (req, res) => {

  const { id } = req.params;

  // Validate the ID format (assuming it's a MongoDB ObjectId)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid contest ID format' });
  }

  // const contest = await Contest.findById(id).populate('questions');
  const contest = await Contest.findById(id)
    .select('-_id -__v') 
    .populate({
      path: 'questions',
      select: 'title difficulty'
    });

  // Check if the contest was found
  if (!contest) {
    return res.status(404).json({ message: 'Contest not found' });
  }

  // Send the contest details in the response
  res.status(200).json(contest);

});


// Create a new contest
export const createContest = AsyncHandler(async (req, res) => {

  // Extract fields from request body
  const { title, description, creator, startTime, endTime, questions } = req.body;

  // console.log(title);
  // console.log(description);
  // console.log(creator);
  // console.log(startTime);
  // console.log(endTime);
  // console.log(questions);

  // Validate required fields
  if (!title || !description || !creator || !startTime || !endTime || !questions) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate field types
  if (!Array.isArray(questions) || !questions.every(mongoose.Types.ObjectId.isValid)) {
    return res.status(400).json({ message: 'Problems must be an array of valid ObjectIds.' });
  }

  // Validate date fields
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Invalid date format for startTime or endTime.' });
  }
  if (start >= end) {
    return res.status(400).json({ message: 'startTime must be before endTime.' });
  }

  // Create new contest
  const newContest = new Contest({
    title,
    description,
    creator,
    startTime: start,
    endTime: end,
    questions
  });

  // Save the contest to the database
  await newContest.save();

  // Send success response
  res.status(201).json(newContest);

});

export const joinContest = AsyncHandler();







// // Get leaderboard for a specific contest
// export const getLeaderboard = AsyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const submissions = await Submission.find({ contest: id })
//     .populate('user')
//     .sort({ score: -1 });

//   // Group submissions by user and calculate total score
//   const leaderboard = submissions.reduce((acc, submission) => {
//     const userId = submission.user._id.toString();
//     if (!acc[userId]) {
//       acc[userId] = {
//         user: submission.user,
//         score: 0
//       };
//     }
//     acc[userId].score += submission.score;
//     return acc;
//   }, {});

//   res.status(200).json(Object.values(leaderboard));
// });
