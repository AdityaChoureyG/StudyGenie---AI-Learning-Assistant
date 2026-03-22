import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";

// @desc Get user learning progress dashboard data
// @route GET /api/progress/dashboard
// @access Private
export const getDeshboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // count total documents
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcards = await Flashcard.countDocuments({ userId });

        const flashcardSets = await Flashcard.find({userId});
        let totalFlashcardSets = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcardSets += set.cards.length;
            reviewedFlashcards += set.cards.filter(card => card.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(card => card.isStarred).length;
        });


        // recent activity 
        const recentDocuments = await Document.find({ userId})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title createdAt');

        const studyStreak = Math.floor(Math.random() * 7) + 1; // Placeholder for actual streak calculation

        res.status(200).json({
            success : true,
            data : {
                totalDocuments,
                totalFlashcards,    
                totalFlashcardSets,
                reviewedFlashcards,
                starredFlashcards,
                recentDocuments,
                studyStreak,
            },
            recentActivity : {
                documents : recentDocuments,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({  
            success : false,    
            message : 'Server Error',
        });
    }   
};
