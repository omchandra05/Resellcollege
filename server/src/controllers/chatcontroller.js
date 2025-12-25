const Conversation = require('../models/Conversation');
const Message = require('../models/message');
const Listing = require('../models/listing');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] }
    })
    .populate('participants', 'name avatar isVerified')
    .populate({ path: 'productId', select: 'title images', model: Listing, strictPopulate: false })
    .sort({ updatedAt: -1 });

    // Deduplicate conversations: keep only the most recent one per product/participant pair
    const uniqueConversations = [];
    const seenMap = new Set();

    for (const conv of conversations) {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );

      if (otherParticipant) {
        const productId = conv.productId ? conv.productId._id.toString() : 'general';
        const uniqueKey = `${otherParticipant._id.toString()}-${productId}`;

        if (!seenMap.has(uniqueKey)) {
          seenMap.add(uniqueKey);
          uniqueConversations.push(conv);
        }
      }
    }

    // Add unread count for the current user
    const conversationsWithUnread = uniqueConversations.map(conv => {
      const convObj = conv.toObject();
      const userUnread = conv.unreadCounts.find(uc => uc.user.toString() === req.user._id.toString());
      convObj.unreadCount = userUnread ? userUnread.count : 0;
      // For frontend compatibility with existing logic
      convObj.unread = convObj.unreadCount > 0; 
      return convObj;
    });

    res.status(200).json({ status: 'success', data: conversationsWithUnread });
  } catch (err) {
    console.error('getConversations Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId
    }).sort({ createdAt: 1 });

    res.status(200).json({ status: 'success', data: messages });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, productId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ status: 'fail', message: 'Receiver and content are required' });
    }

    // Ensure we have a valid productId string
    const pId = (productId?._id || productId)?.toString();

    // Find or create conversation specific to this product
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
      productId: pId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
        productId: pId
      });
    }

    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: content
    });

    // Update unread count for the receiver
    const receiverUnreadIndex = conversation.unreadCounts.findIndex(
      uc => uc.user.toString() === receiverId
    );

    if (receiverUnreadIndex > -1) {
      conversation.unreadCounts[receiverUnreadIndex].count += 1;
    } else {
      // If the user has no unread entry, create one
      conversation.unreadCounts.push({ user: receiverId, count: 1 });
    }

    conversation.lastMessage = content;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      const populatedMsg = await newMessage.populate('sender', 'name avatar isVerified');
      conversation.participants.forEach(participantId => {
        io.to(participantId.toString()).emit('message:receive', populatedMsg);
      });
    }

    res.status(201).json({ status: 'success', data: newMessage });
  } catch (err) {
    console.error('SendMessage Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ status: 'fail', message: 'Conversation not found' });
    }

    const userUnreadIndex = conversation.unreadCounts.findIndex(
      uc => uc.user.toString() === userId.toString()
    );

    if (userUnreadIndex > -1) {
      if (conversation.unreadCounts[userUnreadIndex].count > 0) {
        conversation.unreadCounts[userUnreadIndex].count = 0;
        await conversation.save();
      }
    }

    res.status(200).json({ status: 'success', message: 'Conversation marked as read' });
  } catch (err) {
    console.error('markConversationAsRead Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
