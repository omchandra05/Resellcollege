const { Server } = require('socket.io');
const socketAuth = require('./middleware/socketAuth');
const Conversation = require('./models/Conversation');
const Message = require('./models/message');
const logger = require('./config/logger');

function initSocket(httpServer, options = {}) {
  const io = new Server(httpServer, {
    cors: options.cors || { origin: '*' }, // Use the passed cors object, or fallback
    path: options.path || '/socket.io',
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info(`Socket connected: ${user._id} (${socket.id})`);

    // join personal room for direct emits
    socket.join(user._id.toString());

    // presence broadcast (optional)
    socket.broadcast.emit('user:online', { userId: user._id });

    // join conversation room (payload: { conversationId, otherUserId })
    socket.on('conversation:join', async ({ conversationId, otherUserId }) => {
      try {
        let conv = null;
        if (conversationId) {
          conv = await Conversation.findById(conversationId);
        } else if (otherUserId) {
          conv = await Conversation.findOne({
            participants: { $all: [user._id, otherUserId] },
            'participants.2': { $exists: false } // ensure 1:1
          });
          if (!conv) {
            conv = await Conversation.create({ participants: [user._id, otherUserId] });
          }
        }
        if (conv) {
          socket.join(conv._id.toString());
          socket.emit('conversation:joined', conv);
        } else {
          socket.emit('error', { message: 'Conversation not found/created' });
        }
      } catch (err) {
        logger.error('conversation:join error: ' + err.message);
      }
    });

    // send message (payload: { conversationId, text, attachments, receiverId })
    socket.on('message:send', async (payload) => {
      try {
        const { conversationId, text, attachments = [], receiverId } = payload;

        // ensure conversation
        let conv = null;
        if (conversationId) {
          conv = await Conversation.findById(conversationId);
        }
        if (!conv && receiverId) {
          conv = await Conversation.findOne({
            participants: { $all: [user._id, receiverId] },
            'participants.2': { $exists: false }
          });
          if (!conv) conv = await Conversation.create({ participants: [user._id, receiverId] });
        }
        if (!conv) return socket.emit('error', { message: 'Conversation not found' });

        const msg = await Message.create({
          conversation: conv._id,
          sender: user._id,
          text,
          attachments
        });

        // update conversation last message time and unread counts
        conv.lastMessageAt = msg.createdAt;
        conv.unreadCounts = conv.unreadCounts || [];

        // increment unread for all participants except sender
        conv.participants.forEach((pId) => {
          const pid = pId.toString();
          if (pid === user._id.toString()) return;
          const idx = conv.unreadCounts.findIndex(u => u.user.toString() === pid);
          if (idx >= 0) conv.unreadCounts[idx].count += 1;
          else conv.unreadCounts.push({ user: pId, count: 1 });
        });

        await conv.save();

        const populated = await msg.populate('sender', 'username name avatar');

        // emit to conversation room
        io.to(conv._id.toString()).emit('conversation:message', populated);

        // emit direct to receiver(s)
        conv.participants.forEach((p) => {
          const id = p.toString();
          if (id !== user._id.toString()) {
            io.to(id).emit('message:receive', populated);
          }
        });

        // ack to sender
        socket.emit('message:sent', populated);
      } catch (err) {
        logger.error('message:send error: ' + err.message);
        socket.emit('error', { message: 'message send failed' });
      }
    });

    // typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('typing', { conversationId, userId: user._id, isTyping });
    });

    // mark messages as read (payload: { conversationId, messageIds })
    socket.on('message:read', async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId || !Array.isArray(messageIds)) return;
        await Message.updateMany(
          { _id: { $in: messageIds }, readBy: { $ne: user._id } },
          { $addToSet: { readBy: user._id } }
        );
        // reset unread count for this user in conversation
        const conv = await Conversation.findById(conversationId);
        if (conv) {
          conv.unreadCounts = (conv.unreadCounts || []).map(u =>
            u.user.toString() === user._id.toString() ? { user: u.user, count: 0 } : u
          );
          await conv.save();
        }
        // notify other participants (optional)
        io.to(conversationId).emit('message:read:ack', { conversationId, messageIds, userId: user._id });
      } catch (err) {
        logger.error('message:read error: ' + err.message);
      }
    });

    socket.on('disconnect', (reason) => {
      socket.leave(user._id.toString());
      socket.broadcast.emit('user:offline', { userId: user._id });
      logger.info(`Socket disconnected: ${user._id} (${socket.id}) - ${reason}`);
    });
  });

  return io;
}

module.exports = initSocket;
