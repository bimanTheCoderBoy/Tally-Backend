
import mongoose from 'mongoose';
import Contest from '../models/Contest.model.js';
import AsyncHandler from "../utils/AsyncHandler.js"
import crypto from 'crypto';
import User from '../models/User.model.js';

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
  res.status(201).json({ contestCode: newContest.contestCode });

});


// Join a contest
export const joinContest = AsyncHandler(async (req, res) => {
  // const { id } = req.params;
  const { userName, contestCode } = req.body;

  // console.log("test");
  // console.log(id);
  // console.log(userName);



  // Validate userName
  if (!userName || !contestCode) {
    return res.status(400).json({ message: 'userName is required' });
  }

  // Find the contest and check if it exists
  const contest = await Contest.findOne({ contestCode });
  if (!contest) {
    return res.status(404).json({ message: 'Contest not found' });
  }

  // Check if the contest is ongoing
  const currentTime = new Date();
  if (currentTime < contest.startTime || currentTime > contest.endTime) {
    return res.status(400).json({ message: 'This contest is not ongoing.' });
  }



  // Add the user to the participants array
  const user = await User.create({
    username: userName
  })
  contest.participants.push(user._id);

  // Add the user to the participants array if not already added
  if (!contest.participants.includes(user._id)) {
    contest.participants.push(user._id);
  }

  // Save the updated contest
  await contest.save();

  const options = {
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    httpOnly: true,
  }
  res.cookie('contest', { userid: user._id, contestCode }, options);

  // Respond with success
  res.status(200).json({ message: 'User successfully joined the contest.', userName });
});





export const submitContest = AsyncHandler(async (req, res) => {
  res.clearCookie('contest');
  res.status(200).json({ message: 'User successfully submitted the contest' });
});




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

export const submitQuestion = AsyncHandler(async (req, res) => {

})