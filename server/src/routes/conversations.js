import express from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// GET /api/conversations - List all projects
router.get('/', async (req, res) => {
    try {
        const conversations = await Conversation.find({}, {
            projectName: 1,
            projectPath: 1,
            techStack: 1,
            totalExchanges: 1,
            firstChatDate: 1,
            lastChatDate: 1
        }).sort({ totalExchanges: -1 });
        
        res.json({
            success: true,
            count: conversations.length,
            projects: conversations
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/conversations/:projectName - Get full chat history for a project
router.get('/:projectName', async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ 
            projectName: req.params.projectName 
        });
        
        if (!conversation) {
            return res.status(404).json({ 
                success: false, 
                error: 'Project not found' 
            });
        }
        
        // Format for chat-window style display
        const chatHistory = [];
        for (const session of conversation.conversations) {
            for (const exchange of session.exchanges) {
                chatHistory.push({
                    type: 'user',
                    message: exchange.prompt,
                    timestamp: exchange.timestamp,
                    sessionId: session.sessionId
                });
                
                if (exchange.response) {
                    chatHistory.push({
                        type: 'assistant',
                        message: exchange.response,
                        timestamp: exchange.timestamp,
                        sessionId: session.sessionId,
                        metadata: {
                            toolsUsed: exchange.toolsUsed,
                            filesEditedCount: exchange.filesEditedCount,
                            modelUsed: exchange.modelUsed
                        }
                    });
                }
            }
        }
        
        res.json({
            success: true,
            project: {
                name: conversation.projectName,
                path: conversation.projectPath,
                techStack: conversation.techStack,
                totalExchanges: conversation.totalExchanges,
                firstChatDate: conversation.firstChatDate,
                lastChatDate: conversation.lastChatDate
            },
            chatHistory
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
