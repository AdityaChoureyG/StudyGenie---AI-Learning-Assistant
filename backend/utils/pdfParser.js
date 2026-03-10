import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * extract text from a PDF file
 * @param {string} filePath - path to the PDF file
 * @return {Promise<{text: string, numPages: number}>} extracted text
 */

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        // pdf parser expect a uint8array, not a buffer
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return {
            text: data.text,
            numPages: data.numpages,
            info : data.info, 
        }
    }
    catch (error) {
        console.error('PDF Extraction Error:', error.message);
        throw new Error('Failed to extract text from PDF');
    }
};