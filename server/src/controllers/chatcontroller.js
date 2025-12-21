const Conversation = require('../models/Conversation');
const Message = require('../models/message');

// GET /api/chat/conversations
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const convs = await Conversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'username name avatar')
      .lean();

    // optionally include last message per conv
    const convsWithLast = await Promise.all(convs.map(async (c) => {
      const last = await Message.findOne({ conversation: c._id }).sort({ createdAt: -1 }).limit(1).populate('sender', 'username name avatar').lean();
      return { ...c, lastMessage: last || null };
    }));

    res.json({ conversations: convsWithLast });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ message: 'conversationId and text required' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text
    });

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/conversations/:id/messages?limit=50&before=<iso>
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const convId = req.params.id;
    const limit = parseInt(req.query.limit, 10) || 50;
    const before = req.query.before ? new Date(req.query.before) : null;

    // ensure user is participant
    const conv = await Conversation.findById(convId);
    if (!conv || !conv.participants.map(String).includes(String(userId))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const filter = { conversation: convId };
    if (before) filter.createdAt = { $lt: before };

    const msgs = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username name avatar')
      .lean();

    // return messages in chronological order (old -> new)
    res.json({ messages: msgs.reverse() });
  } catch (err) {
    next(err);
  }
};

// POST /api/chat/conversations  (body: { participantId })
exports.createOrGetConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const other = req.body.participantId;
    if (!other) return res.status(400).json({ message: 'participantId required' });

    let conv = await Conversation.findOne({
      participants: { $all: [userId, other] },
      'participants.2': { $exists: false }
    });

    if (!conv) conv = await Conversation.create({ participants: [userId, other] });

    res.json({ conversation: conv });
  } catch (err) {
    next(err);
  }
};
