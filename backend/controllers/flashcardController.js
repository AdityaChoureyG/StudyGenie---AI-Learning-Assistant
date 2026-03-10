import Flashcard from "../models/Flashcard";

// @desc get all flashcards for a document
// @route GET /api/flashcards/:documentId
// @access Private
export const getFlashcards = async (req, res, next) => {
    try{
        const flashcards = await Flashcard.find({ 
            document: req.params.documentId, user: req.user._id
        })
            .populate('document', 'title') // populate document title
            .sort({ createdAt: -1 }); // sort by newest first

        res.status(200).json({  
            success: true,
            count : flashcards.length,
            data : flashcards
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc get all flashcard sets for a user
// @route GET /api/flashcards
// @access Private
export const getAllFlashcardSets = async (req, res, next) => {
    try{
        const flashcardSets = await Flashcard.find({ user: req.user._id })
            .populate('document', 'title') // populate document title
            .sort({ createdAt: -1 }); // sort by newest first

        res.status(200).json({
            success:true,
            count: flashcardSets.length,    
            data: flashcardSets
        });
    }
    catch (error) { 
        next(error);
    }
};

// @desc review a flashcard
// @route POST /api/flashcards/:cardId/review
// @access Private
export const reviewFlashcard = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({ 
            'cards._id': req.params.cardId, userId: req.user._id
        });

        if(!flashcardSet) {    
            return res.status(404).json({
                success: false,
                error : 'Flashcard set or card not found',
                statusCode: 404,
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(c => c._id.toString() === req.params.cardId);

        if(cardIndex === -1) {  
            return res.status(404).json({   
                success: false,
                error : 'Flashcard not found in the set',
                statusCode: 404,
            });
        }

        // Update review data
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcard reviewed successfully' 
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc toggle star a flashcard
// @route PUT /api/flashcards/:cardId/star
// @access Private
export const toggleStarFlashcard = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({ 
            'cards._id': req.params.cardId, userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({   
                success: false,
                error: "Flashcard set or card not found",
                statusCode: 404,
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(c => c._id.toString() === req.params.cardId);    

        if(cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Flashcard not found in the set",
                statusCode: 404,
            });
        }

        // Toggle star
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: flashcardSet.cards[cardIndex].isStarred ? 'Flashcard starred' : 'Flashcard unstarred'
        });

    }
    catch (error) {
        next(error);
    }
};

// @desc delete a flashcard set
// @route DELETE /api/flashcards/:id
// @access Private
export const deleteFlashcardSet = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({ 
            _id: req.params.id,
            userId: req.user._id,
        });

        if(!flashcardSet) {
            return res.status(404).json({   
                success: false,
                error: "Flashcard set or card not found",
                statusCode: 404,
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({  
            success: true,
            message: 'Flashcard set deleted successfully'
        });

    }
    catch (error) {
        next(error);
    }
};