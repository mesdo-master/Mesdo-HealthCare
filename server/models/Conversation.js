const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    // Enhanced participants array supporting different user types
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "participants.userType",
        },
        userType: {
          type: String,
          required: true,
          enum: ["User", "BusinessProfile"],
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["member", "admin", "owner"],
          default: "member",
        },
        // Last seen message timestamp for read receipts
        lastSeen: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Conversation metadata
    isGroup: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dy9voteoc/image/upload/v1747562237/1221bc0bdd2354b42b293317ff2adbcf_icon_hl56bn.png",
    },

    // Enhanced category system
    category: {
      type: String,
      enum: [
        "Personal",
        "Jobs",
        "Groups",
        "Organization",
        "Recruitment",
        "Support",
      ],
      default: "Personal",
      index: true,
    },

    // Related entities
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
    },

    // Message tracking
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageSender: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "lastMessageSender.userType",
      },
      userType: {
        type: String,
        enum: ["User", "BusinessProfile"],
      },
    },

    // Message statistics
    messageCount: {
      type: Number,
      default: 0,
    },

    // Privacy and settings
    isPrivate: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowInvites: {
        type: Boolean,
        default: true,
      },
      muteNotifications: {
        type: Boolean,
        default: false,
      },
      archiveAfterDays: {
        type: Number,
        default: null,
      },
    },

    // Status tracking
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
      index: true,
    },

    // Metadata
    createdBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "createdBy.userType",
      },
      userType: {
        type: String,
        enum: ["User", "BusinessProfile"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
ConversationSchema.index({ "participants.user": 1, category: 1 });
ConversationSchema.index({ lastMessageTime: -1 });
ConversationSchema.index({ status: 1, category: 1 });

// Virtual for participant count
ConversationSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Methods
ConversationSchema.methods.addParticipant = function (
  userId,
  userType,
  role = "member"
) {
  const existingParticipant = this.participants.find(
    (p) => p.user.toString() === userId.toString() && p.userType === userType
  );

  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      userType: userType,
      role: role,
      joinedAt: new Date(),
    });
  }

  return this.save();
};

ConversationSchema.methods.removeParticipant = function (userId, userType) {
  this.participants = this.participants.filter(
    (p) => !(p.user.toString() === userId.toString() && p.userType === userType)
  );

  return this.save();
};

ConversationSchema.methods.updateLastMessage = function (
  message,
  senderId,
  senderType
) {
  this.lastMessage = message;
  this.lastMessageTime = new Date();
  this.lastMessageSender = {
    user: senderId,
    userType: senderType,
  };
  this.messageCount += 1;

  return this.save();
};

ConversationSchema.methods.isParticipant = function (userId, userType) {
  return this.participants.some(
    (p) => p.user.toString() === userId.toString() && p.userType === userType
  );
};

// Static methods
ConversationSchema.statics.findByParticipant = function (
  userId,
  userType,
  category = null
) {
  const query = {
    "participants.user": userId,
    "participants.userType": userType,
    status: "active",
  };

  if (category) {
    query.category = category;
  }

  return this.find(query)
    .populate("participants.user")
    .populate("job")
    .populate("organization")
    .sort({ lastMessageTime: -1 });
};

ConversationSchema.statics.createConversation = function (
  participants,
  options = {}
) {
  const conversation = new this({
    participants: participants,
    category: options.category || "Personal",
    name: options.name,
    description: options.description,
    isGroup: participants.length > 2,
    job: options.job,
    organization: options.organization,
    createdBy: options.createdBy,
    settings: options.settings || {},
  });

  return conversation.save();
};

module.exports = mongoose.model("Conversation", ConversationSchema);
