const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ],
  
  // New fields for groups
  isGroup:      { type: Boolean, default: false },
  name:         { type: String, trim: true },             // e.g. “Project Team”
  avatar:       { type: String, default: 'https://res.cloudinary.com/dy9voteoc/image/upload/v1747562237/1221bc0bdd2354b42b293317ff2adbcf_icon_hl56bn.png' },            // group picture URL
  admins: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
  ],
  description:  { type: String, default: '' },

  lastMessage:     { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['Personal','Jobs','Groups','Organization','Recruitment'],
    default: 'Personal',
  },
  job: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
