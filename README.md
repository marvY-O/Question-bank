# Question Paper Generator Application

## Overview

This application is designed to generate question papers based on a set of predefined questions stored in a Question Store (datase.json). Each question in the store is characterized by attributes such as the question itself, subject, topic, difficulty level, and marks.

## Tech Stack
NodeJS, Express

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/marvy-O/Question-bank.git
   cd Question-bank
   ```
2. **Install Dependencies**

    ```bash
    npm install
    ```
3. **Run Server**
    ```bash
    node index.js
    ```

## Usage Example

To retrieve a list of users, you can make a `GET` request to `/fetch ` endpoint with a json configuration.

```json
{
    "total_marks": 10,
    "difficulty":{
        "easy": 0.2,
        "medium": 0.5,
        "hard": 0.3,
        "strict": true
    }
}
```

Result
```json
{
    "metadata": {
        "marks": {
            "easy": 2,
            "medium": 5,
            "hard": 3
        },
        "count": {
            "easy": 2,
            "medium": 2,
            "hard": 1
        }
    },
    "questions": [
        {
            "id": 2,
            "question": "What is the best way to make a cup of coffee?",
            "subject": "Cooking",
            "topic": "Coffee",
            "difficulty": "Easy",
            "marks": 1
        },
        {
            "id": 1,
            "question": "What is the capital of France?",
            "subject": "History",
            "topic": "World Geography",
            "difficulty": "Easy",
            "marks": 1
        },
        {
            "id": 52,
            "question": "Solve the equation 3x + 5 = 14.",
            "subject": "Mathematics",
            "topic": "Algebra",
            "difficulty": "Medium",
            "marks": 3
        },
        {
            "id": 51,
            "question": "Who is the current President of the United States?",
            "subject": "Politics",
            "topic": "US Government",
            "difficulty": "Medium",
            "marks": 2
        },
        {
            "id": 28,
            "question": "Analyze the factors contributing to the development of anxiety disorders and discuss potential therapeutic interventions.",
            "subject": "Psychology",
            "topic": "Anxiety Disorders",
            "difficulty": "Hard",
            "marks": 3
        }
    ]
}
```

## Key features
1. Proper error handling for edge cases.
2. In memory storage from dataset.json file.
3. The code is designed to be scalable, allowing for easy integration of additional features and modules the application evolves.

## Additional Features
1. Strict parameter in difficulty configuration allows the code to return the questions even if the marks don't add up exactly. If the strict parameter is set to false then a closest-sum approach is followed, if it is true then exact-sum approach is used.
2. If some parameter in difficulty configuration is missing then if possible, they are assumed otherwise suitable error is thrown.
3. Additional filters on the questions can be added in a middleware fashion in the query handling.
