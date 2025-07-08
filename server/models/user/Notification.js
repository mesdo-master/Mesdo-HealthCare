const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    username: String,
    fullName: String,
    profileImage: String, 
    message: String,      
  },
  status: {
    type: String,
    default: "pending"
  },
  mode: {
    type: String,
    enum: ['individual', 'recruiter'],
    required: true
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
