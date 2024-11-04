import { NextResponse } from 'next/server';
import { run, answerSubjectQuestion, solveProblem, generateReflectionQuestion, generateQuiz, generateVisualAidDescription, relateToRealWorld } from '../../lib/gemini';

export async function POST(req) {
    const data = await req.json();
    try {
        let response;
        switch (data.action) {
            case 'chat':
                response = await run(data.messages);
                break;
            case 'answerQuestion':
                response = await answerSubjectQuestion(data.question);
                break;
            case 'solveProblem':
                response = await solveProblem(data.problem);
                break;
            case 'reflectionQuestion':
                response = await generateReflectionQuestion(data.topic);
                break;
            case 'generateQuiz':
                response = await generateQuiz(data.topic, data.numQuestions);
                break;
            case 'visualAid':
                response = await generateVisualAidDescription(data.topic);
                break;
            case 'relateToRealWorld':
                response = await relateToRealWorld(data.concept);
                break;
            default:
                response = "Invalid action. Valid actions are: 'chat', 'answerQuestion', 'solveProblem', 'reflectionQuestion', 'generateQuiz', 'visualAid', 'relateToRealWorld'";
        }
        return NextResponse.json({ result: response }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 }); 
    }
}
