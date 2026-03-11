import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';


// @ generate flashcards from a document
// @ route POST /api/ai/generate-flashcards
// @ access Private
export const generateFlashcards = async (req, res) => {
    try{
        const { documentId, count = 10 } = req.body;

        if(!documentId) {   
            return res.status(400).json({
                success: false,
                error : 'please provide a documentId',
                statusCode: 400,
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        // console.log(req.user._id, documentId, document);

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready for processing',
                statusCode: 404,
            });
        }

        // generate flashcards using Gemini API
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );

        // save to database
        const flashcardSet = await Flashcard.create({
            userId : req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false,
            })),
        });

        res.status(201).json({
            success: true,
            data : flashcardSet,
            message : "flashcards generated successfully",
            statusCode: 201,
        });

    }
    catch(error) {  
        next(error);
    }
};

// @ generate quiz from a document
// @ route POST /api/ai/generate-quiz
// @ access Private
export const generateQuiz = async (req, res) => {
    try{
        const {documentId, numQuestions=5, title} = req.body;

        if(!documentId) {
            return res.status(400).json({
                success: false,
                error : 'please provide a documentId',
                statusCode: 400,
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready for processing',
                statusCode: 404,
            });
        }

        // generate quiz using Gemini API
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // save to database
        const quiz = await Quiz.create({
            userId : req.user._id,
            documentId: document._id,
            title: title || `Quiz for ${document.title}`, 
            questions : questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
        });

        res.status(201).json({
            success: true,
            data : quiz,
            message : "Quiz generated successfully",
            statusCode: 201,
        }); 
    }
    catch(error) {  
        next(error);
    }
};


// @ generate summary from a document
// @ route POST /api/ai/generate-summary
// @ access Private
export const generateSummary = async (req, res) => {
    try{
        const { documentId } = req.body;

        if(!documentId) {
            return res.status(400).json({
                success: false,
                error : 'please provide a documentId',
                statusCode: 400,
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if(!document){
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready for processing',
                statusCode: 404,
            });
        }

        // generate summary using Gemini API
        const summary = await geminiService.generateSummary(document.extractedText);
        res.status(200).json({
            success: true,
            data : {
                documentId: document._id,
                title: document.title,
                summary,
            },
            message : "Summary generated successfully",
            
            statusCode: 200,
        });

    }
    catch(error) {  
        next(error);
    }
};

// @ chat with AI about a document
// @ route POST /api/ai/chat
// @ access Private
export const chat = async (req, res) => {
    try{
        const { documentId, question} = req.body;

        if(!documentId || !question){
            return res.status(400).json({
                success: false,
                error : "Please provide documentId and question", 
                statusCode : 400
            })
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if(!document){
            res.status(404).json({
                success : false,
                error : "document not found / ready",
                statusCode : 404
            })
        }

        


    }
    catch(error) {  
        next(error);
    }
};


// @ explain concept from a document
// @ route POST /api/ai/explain
// @ access Private
export const explainConcept = async (req, res) => {
    try{

    }
    catch(error) {  
        next(error);
    }
};

// @ get chat history for a document
// @ route GET /api/ai/chat-history/:documentId
// @ access Private
export const getChatHistory = async (req, res) => {
    try{

    }
    catch(error) {  
        next(error);
    }
};


