const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatcontroller');
const { protect } = require('../middleware/authMiddleware');

router.get('/test', (req, res) => res.json({ message: 'Chat router is working' }));

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/send', chatController.sendMessage);
router.post('/conversations/:conversationId/read', chatController.markConversationAsRead);

module.exports = router;