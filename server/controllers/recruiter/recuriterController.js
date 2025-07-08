const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const Business = require("../../models/recruiter/BusinessProfile");
const mongoose = require('mongoose');
const { io } = require('../../utils/socket');
const User = require("../../models/user/User");

const checkRecuriter = async (req, res) => {
  try {
    // Validate that the user is authenticated and has a valid _id.
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ userId: req.user._id });
    if (existingRecruiter) {
      return res
        .status(200)
        .json({ message: "Recruiter already exists", recruiter: existingRecruiter });
    }

    // Create a new recruiter and save it.
    const newRecruiter = new Business({ userId: req.user._id });
    await newRecruiter.save();

    // Return a 201 status for successful creation.
    return res
      .status(201)
      .json({ message: "Recruiter created successfully", recruiter: newRecruiter });
  } catch (error) {
    console.error("Error in checkRecruiter:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const orgLogoUpload = async (req, res) => {
  try {
    // Validate that the user is authenticated and has a valid _id.
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ userId: req.user._id });
    if (!existingRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // Update the recruiter's orgLogo field with the uploaded file path.
    existingRecruiter.orgLogo = req.file.path;
    await existingRecruiter.save();

    return res.status(200).json({ message: "Logo uploaded successfully", recruiter: existingRecruiter });
  } catch (error) {
    console.error("Error in orgLogoUpload:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

const orgBannerUpload = async (req, res) => {
  try {
    // Validate that the user is authenticated and has a valid _id.
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ userId: req.user._id });
    if (!existingRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // Update the recruiter's orgLogo field with the uploaded file path.
    existingRecruiter.orgBanner = req.file.path;
    await existingRecruiter.save();

    return res.status(200).json({ message: "Logo uploaded successfully", recruiter: existingRecruiter });
  } catch (error) {
    console.error("Error in orgLogoUpload:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


const fetchOrgData = async (req, res) => {
  try {

    const { orgname } = req.query;

    // Check if a recruiter already exists for the user.
    const existingRecruiter = await Business.findOne({ _id: orgname });

    if (!existingRecruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({ recruiter: existingRecruiter });
  } catch (error) {
    console.error("Error in fetchOrgData:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Set by protectRoute middleware
    const updateFields = req.body;

    const updatedProfile = await Business.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true } // Create one if not exists
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


const initiateChatRecuriter = async (req, res) => {
  const { jobId, orgId, receiverId } = req.body;

  if (!jobId || !orgId || !receiverId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (orgId === receiverId) {
    return res.status(400).json({ message: "Cannot initiate chat with yourself" });
  }

  const senderId = orgId;
  console.log("Recruiter controller", senderId, orgId, receiverId);

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      category: "Recruitment",
      job: jobId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        category: "Recruitment",
        job: jobId
      });
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (err) {
    console.error("initiateChatRecuriter error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};


const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, conversationId, senderId } = req.body;

    if (!text && !req.file) {
      return res.status(400).json({ error: "Message is empty." });
    }

    let conversation;

    // 1. Validate conversationId
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findById(conversationId);
    }

    // 2. If not found and not a group, create/find 1-1 conversation
    // if (!conversation && receiverId) {
    //   conversation = await Conversation.findOne({
    //     participants: { $all: [senderId, receiverId], $size: 2 },
    //     category: "Recruitment",
    //     isGroup: false,
    //   });

    //   if (!conversation) {
    //     conversation = await Conversation.create({
    //       participants: [senderId, receiverId],
    //       category: "Recruitment",
    //       isGroup: false,
    //     });
    //   }
    // }

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // 3. Create the message
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: text,
      conversationId: conversation._id,
    });

    const populatedMessage = await Message.findById(newMessage._id).lean();

    // 4. Update conversation metadata
    conversation.lastMessage = populatedMessage.message;
    conversation.lastMessageTime = Date.now();
    await conversation.save();

    // 5. Emit to all participants
    // conversation.participants.forEach((participantId) => {
    //   io.to(participantId.toString()).emit("newMessage", populatedMessage); --> Future
    // });
    io.emit("newMessage", populatedMessage);
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
};


const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { orgId } = req.query;

    // Fetch conversation and messages
    const [conversation, messages] = await Promise.all([
      Conversation.findById(conversationId),
      Message.find({ conversationId }).sort({ createdAt: 1 })
    ]);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    const otherUser = conversation.participants.find(user => user._id.toString() !== orgId);
    if (!otherUser) {
      return res.status(400).json({
        success: false,
        message: "Other user not found in the conversation"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      otherUser,
      messages
    });

  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Fetching chat history failed",
      error: error.message || error
    });
  }
}

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const BusinessProfile = await Business.findOne({userId:userId});

    const conversations = await Conversation.find({
      participants: BusinessProfile._id,
    })
      .populate({
        path: "lastMessage",
        select: "text image createdAt",
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Get participant info excluding the current user
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {

        const otherParticipantId = conv.participants.find(
          (id) => id.toString() !== BusinessProfile._id.toString()
        );

        const user = await User.findById(otherParticipantId).select(
          "name profilePicture"
        );

        return {
          ...conv,
          otherParticipant: user,
        };
      })
    );

    res.status(200).json(populatedConversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
};

module.exports = { getAllConversations,sendMessage, checkRecuriter, orgLogoUpload, fetchOrgData, orgBannerUpload, updateProfile, initiateChatRecuriter, getMessages };