import express from "express";
import {
    getFlashcards,
    getAllFlashcardSets,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet,     
} from "../controllers/flashcardController.js";
import protect from "../middleware/auth.js";


const router = express.Router();

router.use(protect); // protect all routes

router.get("/", getAllFlashcardSets); 
router.get("/:documentId", getFlashcards);
router.post('/:cardId/review', reviewFlashcard);
router.put('/:cardId/star', toggleStarFlashcard);
router.delete("/:documentId", deleteFlashcardSet);

export default router;