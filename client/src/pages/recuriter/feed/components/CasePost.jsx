import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Eye,
  Plus,
  Send,
} from "lucide-react";

const CasePost = ({ post, onUpdatePost, currentUserProfile }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [localPost, setLocalPost] = useState(post);
  const [commentLikes, setCommentLikes] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleLike = () => {
    const newLikeState = !isLiked;
    setIsLiked(newLikeState);

    const updatedPost = {
      ...localPost,
      likes: newLikeState ? localPost.likes + 1 : localPost.likes - 1,
    };
    setLocalPost(updatedPost);

    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    }
  };

  const handleComment = (e) => {
    if (e.key === "Enter" && newComment.trim()) {
      const newCommentObj = {
        id: Date.now(),
        author: {
          name:
            currentUserProfile?.orgName || currentUserProfile?.name || "You",
          avatar:
            currentUserProfile?.orgLogo ||
            currentUserProfile?.profilePicture ||
            "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
        },
        content: newComment.trim(),
        timeAgo: "Just now",
        likes: 0,
        replies: [],
      };

      const updatedPost = {
        ...localPost,
        comments: [...(localPost.comments || []), newCommentObj],
      };
      setLocalPost(updatedPost);

      if (onUpdatePost) {
        onUpdatePost(updatedPost);
      }

      setNewComment("");
    }
  };

  const handleCommentLike = (commentIndex, replyIndex = null) => {
    const commentKey =
      replyIndex !== null
        ? `${commentIndex}-${replyIndex}`
        : commentIndex.toString();
    const isCurrentlyLiked = commentLikes[commentKey] || false;
    const newLikeState = !isCurrentlyLiked;

    setCommentLikes({
      ...commentLikes,
      [commentKey]: newLikeState,
    });

    const updatedComments = [...localPost.comments];

    if (replyIndex !== null) {
      // Like a reply
      updatedComments[commentIndex].replies[replyIndex].likes += newLikeState
        ? 1
        : -1;
    } else {
      // Like a comment
      updatedComments[commentIndex].likes += newLikeState ? 1 : -1;
    }

    const updatedPost = {
      ...localPost,
      comments: updatedComments,
    };

    setLocalPost(updatedPost);

    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    }
  };

  const handleReply = (commentIndex) => {
    if (replyText.trim()) {
      const newReply = {
        id: Date.now(),
        author: {
          name:
            currentUserProfile?.orgName || currentUserProfile?.name || "You",
          avatar:
            currentUserProfile?.orgLogo ||
            currentUserProfile?.profilePicture ||
            "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
        },
        content: replyText.trim(),
        timeAgo: "Just now",
        likes: 0,
      };

      const updatedComments = [...localPost.comments];
      if (!updatedComments[commentIndex].replies) {
        updatedComments[commentIndex].replies = [];
      }
      updatedComments[commentIndex].replies.push(newReply);

      const updatedPost = {
        ...localPost,
        comments: updatedComments,
      };

      setLocalPost(updatedPost);

      if (onUpdatePost) {
        onUpdatePost(updatedPost);
      }

      setReplyText("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <img
              src={localPost.author.avatar}
              alt={localPost.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {localPost.author.name}
                </h3>
                <span className="text-sm" style={{ color: "#1890FF" }}>
                  @{localPost.author.username}
                </span>
              </div>
              <p className="text-gray-500 text-xs">{localPost.author.title}</p>
              <p className="text-gray-400 text-xs">{localPost.timeAgo}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Case Tags */}
        <div className="flex flex-wrap gap-2 mt-3 mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            Dermatology
          </span>
          {localPost.isCritical && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
              Critical Case
            </span>
          )}
        </div>

        {/* Case Summary Section */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
          <h3 className="font-semibold text-blue-700 mb-4 text-sm">
            Case Summary:{" "}
            {localPost.content ||
              "A typical representation of the Takatsubo Cardiopathy"}
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-24 flex-shrink-0">
                Patient:
              </span>
              <span className="text-gray-600">
                {localPost.patientAge} {localPost.patientGender}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-24 flex-shrink-0">
                Presentation:
              </span>
              <span className="text-gray-600">
                {localPost.presentation ||
                  "A dermatologist is a medical doctor who specializes in conditions that affect the skin, hair, and nails."}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-24 flex-shrink-0">
                Key Finding:
              </span>
              <span className="text-gray-600">
                {localPost.keyFindings ||
                  "A dermatologist is a medical doctor who specializes in conditions that affect the skin, hair, and nails."}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-gray-700 w-24 flex-shrink-0">
                Outcome:
              </span>
              <span className="text-gray-600">
                {localPost.outcome ||
                  "Complete recovery at 6-week follow-up with lifestyle modifications"}
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-gray-800 text-sm leading-relaxed mb-3">
            A @Alfredz is a medical doctor who specializes in conditions that
            affect the skin, hair, and nails.
          </p>
          {localPost.hashtags && localPost.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {localPost.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm"
                  style={{ color: "#1890FF" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Case Engagement Stats */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
            <span>
              {localPost.author.name} and {localPost.likes} others
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {localPost.comments?.length || 0} comments
          </div>
        </div>

        {/* Case Action Buttons */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isLiked
                  ? "text-red-500 bg-red-50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm">{localPost.likes}</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              <span className="text-sm">61K</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm">+ Follow Case</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <Share className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Existing Comments */}
          {localPost.comments && localPost.comments.length > 0 && (
            <div className="p-4 space-y-3">
              {localPost.comments.map((comment, commentIndex) => (
                <div key={comment.id || commentIndex} className="space-y-2">
                  {/* Main Comment */}
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.timeAgo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">
                          {comment.content}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 ml-3">
                        <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                          Helpful
                        </button>
                        <button
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === commentIndex ? null : commentIndex
                            )
                          }
                        >
                          Reply
                        </button>
                        <button
                          className={`flex items-center space-x-1 text-xs transition-colors ${
                            commentLikes[commentIndex.toString()]
                              ? "text-red-500"
                              : "text-gray-500 hover:text-red-500"
                          }`}
                          onClick={() => handleCommentLike(commentIndex)}
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              commentLikes[commentIndex.toString()]
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {comment.replies.length > 2 && (
                        <button className="text-xs text-blue-600 hover:text-blue-700 transition-colors mb-2">
                          See all {comment.replies.length} replies
                        </button>
                      )}
                      {comment.replies.map((reply, replyIndex) => (
                        <div
                          key={reply.id || replyIndex}
                          className="flex items-start space-x-3"
                        >
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-xs text-gray-900">
                                  {reply.author.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {reply.timeAgo}
                                </span>
                              </div>
                              <p className="text-xs text-gray-800">
                                {reply.content}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 ml-3">
                              <button
                                className={`flex items-center space-x-1 text-xs transition-colors ${
                                  commentLikes[`${commentIndex}-${replyIndex}`]
                                    ? "text-red-500"
                                    : "text-gray-500 hover:text-red-500"
                                }`}
                                onClick={() =>
                                  handleCommentLike(commentIndex, replyIndex)
                                }
                              >
                                <Heart
                                  className={`w-3 h-3 ${
                                    commentLikes[
                                      `${commentIndex}-${replyIndex}`
                                    ]
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />
                                {reply.likes > 0 && <span>{reply.likes}</span>}
                              </button>
                              <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === commentIndex && (
                    <div className="ml-11 mt-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            currentUserProfile?.orgLogo ||
                            currentUserProfile?.profilePicture ||
                            "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                          }
                          alt="Your profile"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder={`Reply to ${comment.author.name}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleReply(commentIndex);
                              }
                            }}
                            className="w-full bg-gray-50 rounded-full px-3 py-1 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-opacity-20 transition-colors"
                            style={{
                              "--tw-ring-color": "#1890FF",
                            }}
                            autoFocus
                          />
                          <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-80"
                            style={{ color: "#1890FF" }}
                            disabled={!replyText.trim()}
                            onClick={() => handleReply(commentIndex)}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <img
                src={
                  currentUserProfile?.orgLogo ||
                  currentUserProfile?.profilePicture ||
                  "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                }
                alt="Your profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Write your comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleComment}
                  className="w-full bg-gray-50 rounded-full px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-opacity-20 transition-colors"
                  style={{
                    "--tw-ring-color": "#1890FF",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasePost;
