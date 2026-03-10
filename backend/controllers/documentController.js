import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private

export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }

        const {title} = req.body;
        if(!title || title.trim().length === 0) {
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'Title is required',
            });
        }
        
        // construct url of the uploaded file

        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        // create document record in database
        const document = await Document.create({
            userId: req.user._id,
            title: title.trim(),
            fileName : req.file.originalname,
            filePath : fileUrl,
            fileSize : req.file.size,
            status: 'processing',
        });

        // process pdf in background
        processPDF(document._id, req.file.path).catch(async (error) => {
            console.error('Background PDF Processing Error:', error.message);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully and is being processed',
        });
    }
    catch (error) {
        // cleanup file on error
        if(req.file) 
            await fs.unlink(req.file.path).catch(()=>{});
        next(error);
    }
}; 

// Helper function to process PDF in background
const processPDF = async (documentId, filePath) => {
    try {
        const {text} = await extractTextFromPDF(filePath);

        // CREATE chunk
        const chunks = chunkText(text, 500, 50);

        // update document with chunks
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks,
            status: 'ready',
        });
         
        console.log(`Document ${documentId} processed with ${chunks.length} chunks`);
    }
    catch (error) {
        console.error(`Error processing document ${documentId}:`, error.message);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
}
        

// @desc    Get all documents for the logged in user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try{
        const document = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) } 
            },
            {
                $lookup : {
                    from : 'flashcards',
                    localField : '_id',
                    foreignField : 'document',
                    as : 'flashcardSets'
                }
            },
            {
                $lookup : {
                    from : 'quizzes',
                    localField : '_id',
                    foreignField : 'documentId',
                    as : 'quizzes'
                }
            },
            {
                $addFields : {
                    flashcardCount : { $size : '$flashcardSets' },
                    quizCount : { $size : '$quizzes' }
                }
            },
            {
                $project : {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0,
                }
            },
            {
                $sort : { uploadDate : -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: document.length,
            data: document,
        });
    }
    catch (error) {
        console.log('Get Documents Error:', error.message);
        next(error);
    }
};

// @desc    Get a single document with chunk
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try{
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!document) {
            res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }

        // get flashcard sets and quizzes count
        const flashcardCount = await Flashcard.countDocuments({ document: document._id, userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });

        // update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        // combine document data with count
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData,
        });

    }
    catch (error) {
        next(error);
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try{
        const document = await Document.findOne({  
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }

        // delete file from filesystem
        await fs.unlink(document.filePath).catch(()=>{});

        // delete document
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',   
        });
    }
    catch (error) {
        next(error);
    }
};