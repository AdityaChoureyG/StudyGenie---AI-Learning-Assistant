import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    documentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Document',
        required : true,
    },
    messages : [
        {
            role : { 
                type : String,
                enum : ['user', 'assistant'],
                required : true,
            },
            content : {
                type : String,
                required : true,
            },
            timestamp : {
                type : Date,
                default : Date.now,
            },
            relevantChunks : {
                type : [Number], // Array of chunk indices that are relevant to this message
                default : [],
            },
        }
    ],
}, {
    timestamps : true,
});

// index for fast query
chatHistorySchema.index({userId : 1, documentId : 1});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);   

export default ChatHistory;