
import Question from '../models/Questions.model.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import {executeCoder} from '../utils/executeCoder.js';

// Get all questions
export const getAllQuestions = AsyncHandler(async (req, res) => {
  // get question tittle and dificulty level only as a form of an array of objects

  
  const questions = await Question.find().select('title difficulty');

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

  // console.log(res.body);
  // console.log(title);
  // console.log(description);
  // console.log(difficulty);
  // console.log(constraints);
  // console.log(testCases);
  // console.log(author);

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


//test code section
export const runTestCase=AsyncHandler(async (req,res)=>{
  const {id}=req.params;
  const { language, code, input } = req.body;
// console.log(language, code, input);

  if(!language||!code){
    throw new ApiError('Missing required fields',400);
  }
  if(!id){
      throw new ApiError('Missing ID',400);
  }

  const question=await Question.findById(id);

  if(!question){
      throw new ApiError('Question not found',404);
  }
  let result=[];
  const testCases=question.testCases;
  for(let i=0; i<testCases.length; i++){
    const tcinput=testCases[i].input;
    const tcoutput=testCases[i].output;
    const actualOutput=executeCoder(language,code,tcinput);
    if(actualOutput!=tcoutput){
      throw new ApiError('Test case failed',400);
    }
    if(actualOutput==tcoutput){
      result.push({
        input:tcinput,
        actualOutput:actualOutput,
        axpectedOutput:tcoutput,
        status:'passed'
      });
    }else{
      result.push({
        input:tcinput,
        actualOutput:actualOutput,
        axpectedOutput:tcoutput,
        status:'failed'
      });
    }

    // console.log(input, expectedOutput);
    // let result=await runCode(language, code, input);
    // if(result!=expectedOutput){
    //   throw new ApiError('Test case failed',400);
    // }
    // console.log('Test case passed');
  }
res.status(200).json(result);
});
 