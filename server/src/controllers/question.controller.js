
import Question from '../models/Questions.model.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import mongoose from 'mongoose';

// Get all questions
export const getAllQuestions = AsyncHandler(async (req, res) => {
  // get question tittle and dificulty level only as a form of an array of objects

  
  const questions = await Question.find().select('title difficulty -_id');

  // If no questions are found, return an empty array, at first when no question is created
  if (!questions.length) {
    return res.status(200).json([]);
  }

  res.status(200).json(questions);
  // res.status(200).json({ message: 'test' });
});


// Get a single question by ID
export const getQuestionById = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid question ID format' });
  }

  const question = await Question.findById(id);
  if (question) {
    res.status(200).json(question);
  }
  else {
    res.status(404).json({ message: 'Question not found' });
  }
});


// Add a new question
export const addQuestion = AsyncHandler(async (req, res) => {
  // console.log("test");
  const { title, description, difficulty, constraints, testCases, author } = req.body;

  console.log(res.body);
  console.log(title);
  console.log(description);
  console.log(difficulty);
  console.log(constraints);
  console.log(testCases);
  console.log(author);

  if (!title || !description || !difficulty || !constraints || !testCases || !author) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate that difficulty is one of the allowed values
  const allowedDifficulties = ['Easy', 'Medium', 'Hard'];
  if (!allowedDifficulties.includes(difficulty)) {
    return res.status(400).json({ message: `Invalid difficulty level. Choose from: ${allowedDifficulties.join(', ')}` });
  }

  const newQuestion = new Question({
    title,
    description,
    difficulty,
    constraints,
    testCases,
    author
  });

  await newQuestion.save();

  console.log("done");
  res.status(201).json(newQuestion);
});

