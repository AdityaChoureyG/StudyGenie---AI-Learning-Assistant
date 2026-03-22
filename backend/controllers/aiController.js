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

        // /.log("Document found:", document.title); 

        // find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(chunk => chunk.chunkIndex);

        // get previous chat history for the document
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id,
        });

        // /.log("Chat history:", chatHistory);

        if(!chatHistory){
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                history: [],
            });
        }

        // generate answer using Gemini API
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        // /.log("Generated answer:", answer);

        // save conversation to chat history
        chatHistory.messages.push({
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: [],
            },{
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices,
            }
        );

        await chatHistory.save();

        res.status(200).json({
            success: true,
            data : {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id,
            },
            message : "Chat response generated successfully",
            statusCode: 200,
        });

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

        const { documentId, concept } = req.body;

        if(!documentId || !concept){
            return res.status(400).json({
                success: false,
                error : "Please provide documentId and concept", 
                statusCode : 400
            })
        }

        const document = await Document.findOne({
            _id : documentId,
            userId : req.user._id,
            status : 'ready'
        });

        if(!document){
            res.status(404).json({
                success: false,
                error : "Document not found/ ready",
                statusCode : 404
            })
        }

        // find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(chunk => chunk.content).join('\n');

        // generate explanation using Gemini API
        const explanation = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data : {
                concept,
                explanation,    
                relevantChunks: relevantChunks.map(chunk => chunk.chunkIndex),
            },
            message : "Concept explained successfully",
            statusCode: 200,
        });


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

        const { documentId } = req.params;  

        if(!documentId){
            return res.status(400).json({
                success : false,
                error : "please provide documentId",
                statusCode : 400
            })
        }

        const chatHistory = await ChatHistory.findOne({
            userId : req.user._id,
            documentId : documentId,
        }).select('messages');

        if(!chatHistory){
            return res.status(404).json({
                success : false,
                error : "Chat history not found",
                statusCode : 404
            })
        }

        res.status(200).json({
            success : true,
            data : chatHistory.messages,
            message : "Chat history retrieved successfully",
            statusCode : 200
        });


    }
    catch(error) {  
        next(error);
    }
};


