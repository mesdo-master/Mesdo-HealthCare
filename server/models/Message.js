const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Conversation reference
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    // Enhanced sender with polymorphic reference
    sender: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "sender.userType",
      },
      userType: {
        type: String,
        required: true,
        enum: ["User", "BusinessProfile"],
      },
    },

    // Enhanced receiver with polymorphic reference (optional for group messages)
    receiver: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "receiver.userType",
      },
      userType: {
        type: String,
        enum: ["User", "BusinessProfile"],
      },
    },

    // Message content
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Message type and metadata
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video", "location", "system"],
      default: "text",
      index: true,
    },

    // File attachments
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "file", "audio", "video"],
        },
        url: String,
        filename: String,
        size: Number,
        mimeType: String,
        thumbnail: String, // For images/videos
      },
    ],

    // Message status and tracking
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
      index: true,
    },

    // Read receipts - array of users who have read this message
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "readBy.userType",
        },
        userType: {
          type: String,
          enum: ["User", "BusinessProfile"],
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Message reactions
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "reactions.userType",
        },
        userType: {
          type: String,
          enum: ["User", "BusinessProfile"],
        },
        emoji: {
          type: String,
          required: true,
        },
        reactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Reply/thread support
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // Message category for filtering
    category: {
      type: String,
      enum: [
        "Personal",
        "Jobs",
        "Groups",
        "Organization",
        "Recruitment",
        "Support",
        "System",
      ],
      default: "Personal",
      index: true,
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // Message flags
    flags: {
      isEdited: {
        type: Boolean,
        default: false,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      isForwarded: {
        type: Boolean,
        default: false,
      },
      isPinned: {
        type: Boolean,
        default: false,
      },
    },

    // Edit history
    editHistory: [
      {
        content: String,
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Delivery tracking
    deliveryStatus: {
      deliveredAt: Date,
      readAt: Date,
      failedAt: Date,
      retryCount: {
        type: Number,
        default: 0,
      },
    },

    // Related entities
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    relatedOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
    },

    // System message data
    systemData: {
      action: String, // 'user_joined', 'user_left', 'conversation_created', etc.
      data: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ "sender.user": 1, "sender.userType": 1 });
messageSchema.index({ messageType: 1, category: 1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ "flags.isDeleted": 1 });

// Virtual for read status
messageSchema.virtual("isRead").get(function () {
  return this.readBy && this.readBy.length > 0;
});

// Virtual for reaction count
messageSchema.virtual("reactionCount").get(function () {
  return this.reactions ? this.reactions.length : 0;
});

// Methods
messageSchema.methods.markAsRead = function (userId, userType) {
  const existingRead = this.readBy.find(
    (r) => r.user.toString() === userId.toString() && r.userType === userType
  );

  if (!existingRead) {
    this.readBy.push({
      user: userId,
      userType: userType,
      readAt: new Date(),
    });
    this.status = "read";
  }

  return this.save();
};

messageSchema.methods.addReaction = function (userId, userType, emoji) {
  // Remove existing reaction from same user for same emoji
  this.reactions = this.reactions.filter(
    (r) =>
      !(
        r.user.toString() === userId.toString() &&
        r.userType === userType &&
        r.emoji === emoji
      )
  );

  // Add new reaction
  this.reactions.push({
    user: userId,
    userType: userType,
    emoji: emoji,
    reactedAt: new Date(),
  });

  return this.save();
};

messageSchema.methods.removeReaction = function (userId, userType, emoji) {
  this.reactions = this.reactions.filter(
    (r) =>
      !(
        r.user.toString() === userId.toString() &&
        r.userType === userType &&
        r.emoji === emoji
      )
  );

  return this.save();
};

messageSchema.methods.editMessage = function (newContent) {
  // Save to edit history
  this.editHistory.push({
    content: this.message,
    editedAt: new Date(),
  });

  // Update message
  this.message = newContent;
  this.flags.isEdited = true;

  return this.save();
};

messageSchema.methods.softDelete = function () {
  this.flags.isDeleted = true;
  this.message = "This message has been deleted";

  return this.save();
};

// Static methods
messageSchema.statics.findByConversation = function (
  conversationId,
  options = {}
) {
  const query = {
    conversationId: conversationId,
    "flags.isDeleted": false,
  };

  const findQuery = this.find(query)
    .populate("sender.user")
    .populate("receiver.user")
    .populate("replyTo")
    .populate("readBy.user")
    .populate("reactions.user")
    .sort({ createdAt: options.sortOrder || 1 });

  if (options.limit) {
    findQuery.limit(options.limit);
  }

  if (options.skip) {
    findQuery.skip(options.skip);
  }

  return findQuery;
};

messageSchema.statics.findUnreadMessages = function (
  userId,
  userType,
  conversationId = null
) {
  const query = {
    "readBy.user": { $ne: userId },
    "sender.user": { $ne: userId },
    "flags.isDeleted": false,
  };

  if (conversationId) {
    query.conversationId = conversationId;
  }

  return this.find(query)
    .populate("sender.user")
    .populate("conversationId")
    .sort({ createdAt: -1 });
};

messageSchema.statics.createMessage = function (data) {
  const message = new this({
    conversationId: data.conversationId,
    sender: {
      user: data.senderId,
      userType: data.senderType,
    },
    receiver: data.receiverId
      ? {
          user: data.receiverId,
          userType: data.receiverType,
        }
      : undefined,
    message: data.message,
    messageType: data.messageType || "text",
    category: data.category || "Personal",
    priority: data.priority || "normal",
    attachments: data.attachments || [],
    replyTo: data.replyTo,
    relatedJob: data.relatedJob,
    relatedOrganization: data.relatedOrganization,
    systemData: data.systemData,
  });

  return message.save();
};

module.exports = mongoose.model("Message", messageSchema);
