import mongoose from "mongoose";
import Contest from "../models/Contest.model.js";
import Question from "../models/Questions.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import crypto from "crypto";
import User from "../models/User.model.js";
import {
  executeCoder,
  runJavaCompile,
  runJavaInDocker,
} from "../utils/executeCoder.js";
// Get all ongoing contests
export const getAllContests = AsyncHandler(async (req, res) => {
  // Find contests where the end time is greater than or equal to the current date
  const contests = await Contest.find().select(
    "title startTime endTime contestCode"
  );

  // Check if there are no ongoing contests
  if (contests.length === 0) {
    return res.status(404).json({ message: "No ongoing contests found." });
  }

  // Send the list of ongoing contests
  res.status(200).json(contests);
});

// Get a single contest by ID
export const getContestById = AsyncHandler(async (req, res) => {
  const { contestcode } = req.params;

  // Validate the ID format (assuming it's a MongoDB ObjectId)


  // const contest = await Contest.findById(id).populate('questions');
  const contest = await Contest.findOne({ contestCode: contestcode }).select(" -__v").populate({
    path: "questions",
    select: "title difficulty",
  });

  // Check if the contest was found
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  // Send the contest details in the response
  res.status(200).json(contest);
});

// Create a new contest
export const createContest = AsyncHandler(async (req, res) => {
  // Extract fields from request body
  const { title, startTime, endTime, questions } = req.body;

  // console.log(title);
  // console.log(description);
  // console.log(creator);
  // console.log(startTime);
  // console.log(endTime);
  // console.log(questions);

  // Validate required fields
  if (!title || !startTime || !endTime || !questions) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate field types
  if (
    !Array.isArray(questions) ||
    !questions.every(mongoose.Types.ObjectId.isValid)
  ) {
    return res
      .status(400)
      .json({ message: "Problems must be an array of valid ObjectIds." });
  }

  // Validate date fields
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res
      .status(400)
      .json({ message: "Invalid date format for startTime or endTime." });
  }
  if (start >= end) {
    return res
      .status(400)
      .json({ message: "startTime must be before endTime." });
  }

  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Create new contest
  const newContest = new Contest({
    title,
    startTime: start,
    endTime: end,
    contestCode: result,
    questions,
  });

  // Save the contest to the database
  await newContest.save();

  // Send success response
  res.status(201).json(newContest.contestCode);
});

// Join a contest
export const joinContest = AsyncHandler(async (req, res) => {
  // const { id } = req.params;
  const { userName, contestCode } = req.body;

  // Validate userName & contestCode
  if (!userName || !contestCode) {
    return res.status(400).json({ message: "userName is required" });
  }

  // Find the contest and check if it exists
  const contest = await Contest.findOne({ contestCode });
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  // Check if the contest is ongoing
  const currentTime = new Date();
  if (currentTime < contest.startTime || currentTime > contest.endTime) {
    return res.status(400).json({ message: "This contest is not ongoing." });
  }

  // Access the 'contest' cookie
  const contestCookie = req.cookies.contest;

  // console.log(contestCookie.userid);

  // Check if the cookie exists
  if (contestCookie) {
    // Extract userid and contestCode from the cookie
    const { userid } = JSON.parse(contestCookie);

    // console.log(contest.participants.includes(userid));
    // console.log(contest.participants);
    console.log(userid);

    // return user details if already added
    if (contest.participants.includes(userid)) {
      const findUser = await User.findById(userid);
      res.status(200).json({
        username: findUser.username,
        questions: findUser.questions,
      });
      return;
    }
  }

  // Add the user to the participants array
  const user = await User.create({
    username: userName,
  });
  contest.participants.push(user._id);

  // Save the updated contest
  await contest.save();

  // Calculate the time difference for the cookie expiration
  const expiresIn = new Date(contest.endTime) - new Date();

  const options = {
    // expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    expires: new Date(Date.now() + expiresIn), // Set expiration to contest end time
    httpOnly: true,
  };
  res.cookie(
    "contest",
    JSON.stringify({ userid: user._id, contestCode }),
    options
  );
  // Respond with success
  res
    .status(200)
    .json({ message: "User successfully joined the contest.", userName });
});

export const submitContest = AsyncHandler(async (req, res) => {
  res.clearCookie("contest");
  res.status(200).json({ message: "User successfully submitted the contest" });
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
  const { qid } = req.params;
  const data = req.cookies.contest;
  const { userid, contestCode } = JSON.parse(data);

  const { code, language, className } = req.body;

  //run the test cases
  // console.log(language, code, input);

  // console.log(language, code, input);

  if (!language || !code) {
    throw new ApiError("Missing required fields", 400);
  }
  if (!qid) {
    throw new ApiError("Missing ID", 400);
  }

  const question = await Question.findById(qid);

  if (!question) {
    throw new ApiError("Question not found", 404);
  }
  let result = [];
  const testCases = question.testCases;

  //compile the code
  const folder = await runJavaCompile(code, className);
  console.log(className + "jjjjjjjjjjjjjjjjjj");
  console.log(folder + "  compiled");
  for (let i = 0; i < testCases.length; i++) {
    const tcinput = testCases[i].input;
    const tcoutput = testCases[i].output;
    let actualOutput = await runJavaInDocker(folder, className, tcinput);
    // if(actualOutput!=tcoutput){
    //   throw new ApiError('Test case failed',400);
    // }
    actualOutput = actualOutput.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    console.log(actualOutput);
    if (actualOutput == tcoutput) {
      result.push({
        input: tcinput,
        actualOutput: actualOutput,
        axpectedOutput: tcoutput,
        status: "passed",
      });
    } else {
      result.push({
        input: tcinput,
        actualOutput: actualOutput,
        axpectedOutput: tcoutput,
        status: "failed",
      });
    }

    // console.log(input, expectedOutput);
    // let result=await runCode(language, code, input);
    // if(result!=expectedOutput){
    //   throw new ApiError('Test case failed',400);
    // }
    // console.log('Test case passed');
  }
  try {
    if (fs.existsSync(folder)) {
      // fs.unlinkSync(`${folder}/TempCode.java`);
      fs.unlinkSync(`${folder}/${className}.class`);
      await fs.promises.rm(folder, { recursive: true, force: true });
    }
  } catch (error) {
    console.log(error);
  }
  let allPassed = true;
  for (let i = 0; i < results.length; i++) {
    if (!results[i].status == "pass") {
      allPassed = false;
      break;
    }
  }
  if (allPassed) {
    await User.findByIdAndUpdate(userid, { $push: { questions: qid } });
  }

  res.status(200).json(result);
});

export const getUser = AsyncHandler(async (req, res, next) => {
  // Access the 'contest' cookie
  const contestCookie = req.cookies.contest;

  // Check if the cookie exists
  if (contestCookie) {
    // Extract userid from the cookie
    const { userid, contestCode } = JSON.parse(contestCookie);

    // return user details if already added
    if (contest.participants.includes(userid)) {
      const findUser = await User.findById(userid);
      res.status(200).json({
        findUser,
        contestCode,
        success: true
      });

    }
  } else {
    return res.status(400).json({ success: false, message: "User not found" });
  }
});



export const getLeaderboard = AsyncHandler(async (req, res) => {
  const { contestcode } = req.params;
  const contest = Contest.findOne({ contestCode: contestcode }).populate("participants");
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  const particepents = contest.participants;
  res.send(particepents);

});