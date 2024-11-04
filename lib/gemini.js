const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");

   //functions and prompts

  const biologyTutorPrompt = `You are Professor Darwin, a knowledgeable and friendly biology tutor with a patient approach to teaching. 
  You make complex biology concepts easy to understand, adapting your explanations to each student’s level and learning pace. 
  Your main focus is to encourage curiosity, answer questions thoroughly, and provide relatable examples that bring biology to life. 
  Whether the topic is cell biology, genetics, evolution, or ecology, you guide students through the material step-by-step, 
  breaking down intricate details while fostering a positive and interactive learning environment. 
  Your primary learning goals are to explore the intricacies of evolution, delve into the fundamentals of genetics, and unravel the biochemistry of living organisms`;
  
  async function answerSubjectQuestion(question) {
    const subjectQAPrompt = `Provide a multi-layered explanation for the following biology question:
    
    Question: ${question}
    
    Respond with a basic explanation first, then progressively offer more detailed insights. If applicable, suggest a relevant visual aid (such as a graph, diagram, or annotated image) that could help illustrate the answer.`;
    
    const result = await model.generateContent(subjectQAPrompt);
    return result.response.text();
  }
  
  async function solveProblem(problem) {
    const problemSolvingPrompt = `Guide the user through solving the following biology problem step-by-step. Provide hints for each step to aid comprehension without giving away the full answer.
    
    Problem: ${problem}
    
    Format:
    Step 1: [Detailed step explanation]
    Hint: [Hint for Step 1]
    
    Step 2: [Detailed step explanation]
    Hint: [Hint for Step 2]
    
    Continue as needed for each step.`;
    
    const result = await model.generateContent(problemSolvingPrompt);
    return result.response.text();
  }
  
  async function relateToRealWorld(concept) {
    const realWorldPrompt = `Explain the following biology concept with a real-life scenario to help the user understand its application.
    
    Concept: ${concept}
    
    After explaining, provide a relevant real-world example that illustrates the concept clearly. If possible, describe a visual aid (e.g., photo, diagram) that would support this connection.`;
    
    const result = await model.generateContent(realWorldPrompt);
    return result.response.text();
  }
  

  async function generateReflectionQuestion(topic) {
    const reflectionPrompt = `Create a thought-provoking question about the following biology topic to encourage critical thinking and reflection.
    
    Topic: ${topic}
    
    Format your response as:
    Question: [Reflection question]
    Options: A) [Option A], B) [Option B], C) [Option C], D) [Option D]
    Explanation: [Brief explanation that encourages deeper thinking on this question]`;
    
    const result = await model.generateContent(reflectionPrompt);
    return result.response.text();
  }
  
  async function generateQuiz(topic, numQuestions) {
    const quizPrompt = `Generate a ${numQuestions}-question quiz on the following biology topic:
    
    Topic: ${topic}
    
    For each question:
    - Provide four options (A, B, C, D)
    - Identify the correct answer
    - Offer a brief explanation for why the answer is correct
    
    This quiz should help the student assess their understanding and reinforce key concepts.`;
    
    const result = await model.generateContent(quizPrompt);
    return result.response.text();
  }
  
  async function generateVisualAidDescription(topic) {
    const visualPrompt = `Describe a simple visual aid to explain the following biology topic.
    
    Topic: ${topic}
    
    Include:
    1. Describe the visual aid in words throughly to paint a picture in the readers mind
    2. Key elements to include
    3. Brief description of how this visual would assist in understanding`;
    
    const result = await model.generateContent(visualPrompt);
    return result.response.text();
  }
  
    

// GEMINI API SETUP  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const safetySettings =[
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ]
  
  async function run(messages) {
    // Keep the last 10 messages or all messages if less than 10
    const historyToKeep = messages.slice(-10);
    const formattedHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [{ role: 'user', parts: [{ text: biologyTutorPrompt }] },
      ...formattedHistory.slice(0, -1)
    ],
    });

    const lastUserMessage = messages[messages.length - 1].content;
    const realWorldPrompt = `${lastUserMessage}

    After explaining the concept, provide a real-world example or application to make it more relatable.`;

    const result = await chatSession.sendMessage(realWorldPrompt);
    return result.response.text();
  }
  
  //run();
  module.exports = { run, answerSubjectQuestion, solveProblem, generateReflectionQuestion, generateQuiz, generateVisualAidDescription, relateToRealWorld };
