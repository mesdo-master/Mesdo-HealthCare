const Notification = require("../../models/user/Notification");
const User = require("../../models/user/User");
const Business = require("../../models/recruiter/BusinessProfile");
const { io } = require("../../utils/socket")




const sendConnectionRequest = async (req, res) => {
    try {
        const { username } = req.body;
        const recipientUser = await User.findOne({ username });
        const senderId = req.user._id;
        const recipientId = recipientUser._id;

        // Check if request already exists
        const existingRequest = await Notification.findOne({
            sender: senderId,
            recipient: recipientId,
            type: "FOLLOW_REQUEST",
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Follow request already sent" });
        }

        // Create notification for follow request
        const notification = new Notification({
            type: "FOLLOW_REQUEST",
            sender: senderId,
            recipient: recipientId,
            mode: "individual",
            data: {
                username: req.user.username,
                fullName: req.user.name,
                profileImage: req.user.profilePicture || "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
                // message: String, 
            }
        });

        await notification.save();

        const senderUser = await User.findById(senderId);
        senderUser.sentRequests.push(recipientId);
        await senderUser.save();

        recipientUser.pendingRequests.push(senderId);
        await recipientUser.save();

        // Emit socket event to recipient
        console.log(`Emitting to ${recipientId.toString()}`);
        io.to(recipientId.toString()).emit("newNotification", {
            type: "FOLLOW_REQUEST",
            senderId,
            senderName: req.user.username,
            notificationId: notification._id,
        });

        res.status(201).json({ message: "Follow request sent" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error sending follow request" });
    }
}

const getFollowStatus = async (req, res) => {
    const { username } = req.params;
    const currentUserId = req.user.id; // assuming you're using auth middleware

    try {
        const targetUser = await User.findOne({ username });
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        if (currentUser.connections.includes(targetUser._id)) {
            return res.json({ status: "following" });
        }

        if (currentUser.sentRequests.includes(targetUser._id)) {
            return res.json({ status: "pending" });
        }

        if (currentUser.pendingRequests.includes(targetUser._id)) {
            return res.json({ status: "accept_or_reject" });
        }

        return res.json({ status: "not_following" });
    } catch (error) {
        console.error("Error getting follow status:", error);
        return res.status(500).json({ error: "Server error" });
    }
};


const withdrawRequest = async (req, res) => {
    const { username } = req.params;
    const currentUserId = req.user.id;

    try {
        const targetUser = await User.findOne({ username });
        const currentUser = await User.findById(currentUserId);


        await Notification.deleteOne({
            sender: currentUser._id,
            recipient: targetUser._id,
            type: "FOLLOW_REQUEST"
        });

        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Check if a request exists
        if (!currentUser.sentRequests.includes(targetUser._id)) {
            return res.status(400).json({ error: 'No pending request to withdraw' });
        }

        // Remove request from both users
        currentUser.sentRequests = currentUser.sentRequests.filter(
            id => id.toString() !== targetUser._id.toString()
        );

        targetUser.pendingRequests = targetUser.pendingRequests.filter(
            id => id.toString() !== currentUserId
        );

        await currentUser.save();
        await targetUser.save();

        return res.json({ success: true, message: "Request withdrawn" });
    } catch (error) {
        console.error("Error withdrawing request:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { notificationId } = req.body;

        if (!notificationId) {
            return res.status(400).json({ message: "Notification ID is required" });
        }

        const notificationFound = await Notification.findById(notificationId);
        if (!notificationFound) {
            return res.status(404).json({ message: "Notification not found" });
        }

        const recipientId = notificationFound.recipient.toString();
        const senderId = notificationFound.sender.toString();


        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);

        if (!recipient || !sender) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        // Remove senderId from recipient.pendingRequests
        recipient.pendingRequests = recipient.pendingRequests.filter(
            (id) => id.toString() !== senderId
        );

        // Remove recipientId from sender.sendRequests
        sender.sentRequests = sender.sentRequests.filter(
            (id) => id.toString() !== recipientId
        );

        // Add each other as connections
        recipient.connections.push(senderId);
        sender.connections.push(recipientId);

        // Save changes
        await recipient.save();
        await sender.save();

        // Delete notification
        await Notification.findByIdAndDelete(notificationId);


        const newNotification = new Notification({
            type: "FOLLOW_ACCEPTED",
            sender: recipientId,
            recipient: senderId,
            mode: "individual",
            status: "Fulfilled",
            data: {
                username: recipient.username,
                fullName: recipient.name,
                profileImage: recipient.profilePicture || "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
                // message: String, 
            }
        });

        await newNotification.save();

        io.to(senderId.toString()).emit("newNotification", {
            type: "FOLLOW_ACCEPTED",
            recipientId,
            senderName: recipient.username,
            notificationId: newNotification._id,
        });

        return res.status(200).json({ message: "Follow request accepted successfully" });

    } catch (error) {
        console.error("Error accepting follow request:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const rejectRequest = async (req, res) => {
    try {
        const { notificationId } = req.body;

        if (!notificationId) {
            return res.status(400).json({ message: "Notification ID is required" });
        }

        const notificationFound = await Notification.findById(notificationId);
        if (!notificationFound) {
            return res.status(404).json({ message: "Notification not found" });
        }

        const recipientId = notificationFound.recipient.toString();
        const senderId = notificationFound.sender.toString();


        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);

        if (!recipient || !sender) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        // Remove senderId from recipient.pendingRequests
        recipient.pendingRequests = recipient.pendingRequests.filter(
            (id) => id.toString() !== senderId
        );

        // Remove recipientId from sender.sendRequests
        sender.sentRequests = sender.sentRequests.filter(
            (id) => id.toString() !== recipientId
        );

        // Save changes
        await recipient.save();
        await sender.save();

        // Delete notification
        await Notification.findByIdAndDelete(notificationId);

        return res.status(200).json({ message: "Follow request rejected successfully" });

    } catch (error) {
        console.error("Error rejecting follow request:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


const unfollowRequest = async (req, res) => {
    try {

        const { username } = req.params;
        const userToUnfollow = await User.findOne({ username });
        const currentUser = req.user;

        if (!userToUnfollow) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Ensure both users are actually connected
        if (!userToUnfollow.connections.includes(currentUser._id)) {
            return res.status(400).json({ success: false, message: "You are not following this user" });
        }

        // Remove currentUser from userToUnfollow's connections
        userToUnfollow.connections = userToUnfollow.connections.filter(
            (id) => id.toString() !== currentUser._id.toString()
        );

        // Remove userToUnfollow from currentUser's connections
        currentUser.connections = currentUser.connections.filter(
            (id) => id.toString() !== userToUnfollow._id.toString()
        );

        // Save both users
        await Promise.all([userToUnfollow.save(), currentUser.save()]);


        res.status(200).json({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
        console.error("Unfollow error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


const followOrganization = async (req, res) => {
    const userId = req.user.id;
    const orgId = req.params.orgId;

    try {
        const user = await User.findById(userId);
        const organization = await Business.findById(orgId).populate('userId');

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Prevent duplicate follow
        if (user.followedOrganizations.includes(orgId)) {
            return res.status(400).json({ message: 'Already following this organization' });
        }

        // Add to user's followedOrganizations
        user.followedOrganizations.push(orgId);
        await user.save();

        // Add user to organization's followers
        organization.followers.push(userId);
        await organization.save();

        // Create notification to org owner (recruiter)
        const notification = new Notification({
            recipient: organization._id,
            sender: userId,
            type: 'follow-organization',
            data: {
                username: user.username,
                fullName: user.name,
                profileImage: user.profilePicture,
                message: `${user.name} started following your organization.`
            },
            mode: 'recruiter'
        });
        await notification.save();

        // Emit real-time notification using Socket.IO
        io.to(organization.userId._id.toString()).emit('newNotification', notification);

        return res.status(200).json({ message: 'Followed organization and notification sent' });
    } catch (err) {
        console.error('Error following organization:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


const unfollowOrganization = async (req, res) => {
    const userId = req.user.id;
    const orgId = req.params.orgId;

    try {
        const user = await User.findById(userId);
        const organization = await Business.findById(orgId);

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Check if user is actually following the organization
        if (!user.followedOrganizations.includes(orgId)) {
            return res.status(400).json({ message: 'You are not following this organization' });
        }

        // Remove org from user's followedOrganizations
        user.followedOrganizations = user.followedOrganizations.filter(
            (id) => id.toString() !== orgId
        );
        await user.save();

        // Remove user from organization's followers
        organization.followers = organization.followers.filter(
            (id) => id.toString() !== userId
        );
        await organization.save();

        return res.status(200).json({ message: 'Unfollowed organization successfully' });
    } catch (err) {
        console.error('Error unfollowing organization:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getOrgFollowStatus = async (req, res) => {
    const { orgId } = req.params;
    const currentUserId = req.user.id; // assuming you're using auth middleware

    try {
        const targetUser = await Business.findById(orgId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) return res.status(404).json({ error: 'org  not found' });

        if (currentUser.followedOrganizations.includes(targetUser._id)) {
            return res.json({ status: true });
        }

        return res.json({ status: false });
    } catch (error) {
        console.error("Error getting org follow status:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getOrgFollowStatus, unfollowOrganization, followOrganization, sendConnectionRequest, getFollowStatus, withdrawRequest, acceptRequest, unfollowRequest, rejectRequest };