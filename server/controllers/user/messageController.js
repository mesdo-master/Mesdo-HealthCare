const Conversation = require("../../models/Conversation");



const getAllConversations = async (req, res) => {
    try {
        const userID = req.user._id;
        const convos = await Conversation.find({
            participants: { $in: [userID] }
        });
        res.status(200).json(convos);
    } catch (error) {
        console.log(error)
        res.status(500).json(err);
    }
}

module.exports = { getAllConversations }