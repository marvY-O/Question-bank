const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')

const dataset_path = 'dataset.json'
var dataset;
var dataset_by_difficulty;

fs.readFile(dataset_path, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  dataset = JSON.parse(data);
  preprocess_dataset();
});

function preprocess_dataset(){
  dataset_by_difficulty = {
    easy: dataset.filter(item => item.difficulty === 'Easy'),
    medium: dataset.filter(item => item.difficulty === 'Medium'),
    hard: dataset.filter(item => item.difficulty === 'Hard')
  }
}

function generate_error(code, message, details) {
  return {
    error: {
      code: code,
      message: message,
      details: details
    }
  };
}

function generate_metadata(questions){
  let total_questions = 0, easy_questions = 0, medium_questions = 0, hard_questions = 0;
  let total_marks = 0, easy_marks = 0, medium_marks = 0, hard_marks = 0;
  for (ques of questions){
    if (ques.difficulty == 'Easy'){
      easy_marks += ques.marks;
      easy_questions+=1;
    }
    if (ques.difficulty == 'Medium'){
      medium_marks += ques.marks;
      medium_questions+=1;
    }
    if (ques.difficulty == 'Hard'){
      hard_marks += ques.marks;
      hard_questions+=1;
    }
    total_questions += 1;
    total_marks += ques.marks;
  }

  return {
    marks:{
      easy: easy_marks,
      medium: medium_marks,
      hard: hard_marks
    },
    count:{
      easy: easy_questions,
      medium: medium_questions,
      hard: hard_questions
    }
  }

}

function findClosestSubset(questions, total) {
  const n = questions.length;

  // Create a 2D array to store results of subproblems
  const dp = Array.from({ length: n + 1 }, () => Array(total + 1).fill(false));

  // Initialize the first row and column
  for (let i = 0; i <= n; i++) {
    dp[i][0] = true;
  }

  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= total; j++) {
      if (questions[i - 1].marks <= j) {
        dp[i][j] = dp[i - 1][j] || dp[i - 1][j - questions[i - 1].marks];
      } else {
        dp[i][j] = dp[i - 1][j];
      }
    }
  }

  // Reconstruct the solution
  let i = n;
  let j = total;
  const selectedQuestions = [];

  while (i > 0 && j > 0) {
    if (dp[i][j] !== dp[i - 1][j]) {
      selectedQuestions.push(questions[i - 1]);
      j -= questions[i - 1].marks;
    }
    i--;
  }

  return selectedQuestions;
}

function get_questions(marks, difficulty, strict){
  let selected_questions = findClosestSubset(dataset_by_difficulty[difficulty], marks)
  let actual_marks = 0;
  for (let ques of selected_questions){ 
    actual_marks+=ques.marks; 
  }
  if (actual_marks == marks){
    return [selected_questions, false];
  }
  if (actual_marks != marks && strict){
    return [generate_error(422, "Insufficient Data", "Questions totaling up to " + marks + " for difficulty: " + difficulty + " could not be fetched. Set strict=false if you want the closest total instead."), true]
  }
  return [selected_questions, false];
}

function filter_by_difficulty(total_marks, difficulty){

  let easy_marks=-1, medium_marks=-1, hard_marks=-1;
  let strict = difficulty['strict'];
  let parameters_provided = [];
  let total_perc = 0;
  let question_set = [];

  if (difficulty['easy'] != undefined){
    parameters_provided.push('easy');
    total_perc += difficulty['easy'];
  }
  if (difficulty['medium'] != undefined){
    parameters_provided.push('medium');
    total_perc += difficulty['medium'];
  }
  if (difficulty['hard'] != undefined){
    parameters_provided.push('hard');
    total_perc += difficulty['hard'];
  }



  //error cases

  if (total_perc > 1){
    return [generate_error(400, "Invalid difficulty parameters", "The difficulty parameters provided sum up greater than 1.0."), true]
  }
  else if (total_perc < 0){
    return [generate_error(400, "Invalid difficulty parameters", "The difficulty parameters provided sum up less than 0."), true]
  }

  if (parameters_provided.length == 3){
    if (total_perc < 1){
      return [generate_error(400, "Invalid difficulty parameters", "The difficulty parameters provided sum up less than 1.0."), true]
    }
  }
  if (parameters_provided.length <= 1){
    if (strict == true){
      return [generate_error(400, "For strict=true, atleast 2 valid parameters need to be provided."), true]
    }
  }

  //preprocessing
  if (parameters_provided.length == 1){
    if (parameters_provided[0] == 'easy'){
      difficulty['medium'] = Math.random() * (1 - difficulty['easy']);
      difficulty['hard'] = 1 - difficulty['easy'] - difficulty['medium'];
    }
    if (parameters_provided[0] == 'medium'){
      difficulty['easy'] = Math.random() * (1 - difficulty['medium']);
      difficulty['hard'] = 1 - difficulty['medium'] - difficulty['easy'];
    }
    if (parameters_provided[0] == 'hard'){
      difficulty['easy'] = Math.random() * (1 - difficulty['hard']);
      difficulty['medium'] = 1 - difficulty['hard'] - difficulty['easy'];
    }
  }
  else if (parameters_provided.length == 2){
    if (!parameters_provided.includes('easy')){
      difficulty['easy'] = 1 - difficulty['medium'] - difficulty['hard'];
    }
    if (!parameters_provided.includes('medium')){
      difficulty['medium'] = 1 - difficulty['hard'] - difficulty['easy'];
    }
    if (!parameters_provided.includes('hard')){
      difficulty['hard'] = 1 - difficulty['medium'] - difficulty['easy'];
    }
  }

  difficulty['hard'] = Math.round(difficulty['hard']*total_marks)/total_marks;
  difficulty['medium'] = Math.round(difficulty['medium']*total_marks)/total_marks;
  difficulty['easy'] = 1 - difficulty['hard'] - difficulty['medium'];

  //get questions
  if (difficulty['easy'] != 'undefined'){
    easy_marks = Math.round(difficulty['easy']*total_marks);
    let [output, error] = get_questions(easy_marks,'easy', strict);
    if (error){
      return [output, true];
    }
    question_set = [...question_set, ...output]
  }

  if (difficulty['medium'] != 'undefined'){
    medium_marks = Math.round(difficulty['medium']*total_marks);
    let [output, error] = get_questions(medium_marks,'medium', strict);
    if (error){
      return [output, true];
    }
    question_set = [...question_set, ...output]
  }

  if (difficulty['hard'] != 'undefined'){
    hard_marks = Math.round(difficulty['hard']*total_marks);
    let [output, error] = get_questions(hard_marks,'hard', strict);
    if (error){
      return [output, true];
    }
    question_set = [...question_set, ...output]
  }

  return [question_set, false]
}

const app = express();
const port = 6000;

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('GET request to homepage')
})

app.get('/fetch', function (req, res) {
  const ques_config = req.body;

  console.log("New Request: ", ques_config)

  let total_marks = ques_config['total_marks']
  let difficulty = ques_config['difficulty']

  if (total_marks == undefined){
    res.json(generate_error(400, "total marks missing", "parameter total_marks is required but missing."))
    return;
  }
  if (difficulty == undefined){
    res.json(generate_error(400, "difficulty missing", "parameter difficulty is required but missing."))
    return;
  }

  let [output, error] = filter_by_difficulty(total_marks, difficulty);
  if (error){
    res.json(output);
    return;
  }



  res.json({
    metadata: generate_metadata(output),
    questions: output
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
}); 