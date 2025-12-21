const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatcontroller');

router.use(protect);

// conversations
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createOrGetConversation);

// messages
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage); // ✅ ADD THIS

module.exports = router;
