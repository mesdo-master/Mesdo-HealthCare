import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import FeedTabs from "./components/FeedTabs";
import CreatePost from "./components/CreatePost";
import FeedPost from "./components/FeedPost";
import CaseCreatePost from "./components/CaseCreatePost";
import CasePost from "./components/CasePost";
import SidebarSuggestions from "./components/SidebarSuggestions";

const RecruiterFeedPage = () => {
  const { currentUser, businessProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize with sample posts
  useEffect(() => {
    const samplePosts = [
      {
        id: 1,
        author: {
          name: "Dr. Alfredo Botosh",
          username: "alfredo",
          title: "Dermatologist - Apollo Hospital",
          avatar:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
        },
        content:
          "A dermatologist is a medical doctor who specializes in conditions that affect the skin, hair, and nails. Whether it's rashes, wrinkles, psoriasis, or melanoma, no one understands your skin, hair, and nails better than a board-certified dermatologist. The skin is an incredible organ",
        hashtags: ["#inclusive"],
        timeAgo: "Posted 3 hours ago",
        likes: 90,
        images: [
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300",
          "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300",
          "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=300",
        ],
        comments: [
          {
            author: {
              name: "Rebecca",
              avatar:
                "https://images.unsplash.com/photo-1494790108755-2616b612b1c1?w=150",
            },
            content:
              "really cool picture ❤️, and the caption gives me goosebumps",
            timeAgo: "1 hour ago",
            likes: 5,
          },
          {
            author: {
              name: "Ksaurubh",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            },
            content: "very cool brother, let's go on vacation together",
            timeAgo: "View 7 replies",
            likes: 2,
          },
          {
            author: {
              name: "Tobias Ricky",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            },
            content: "can i join with you guys? 😊",
            timeAgo: "30 minutes ago",
            likes: 8,
          },
          {
            author: {
              name: "Tobias Ricky",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            },
            content: "let's go for a holiday together 😊",
            timeAgo: "20 minutes ago",
            likes: 12,
          },
        ],
      },
      {
        id: 2,
        author: {
          name: "Dr. Alfredo Botosh",
          username: "alfredo",
          title: "Dermatologist - Apollo Hospital",
          avatar:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
        },
        content:
          "A dermatologist is a medical doctor who specializes in conditions that affect the skin, hair, and nails. Whether it's rashes, wrinkles, psoriasis, or melanoma, no one understands your skin, hair, and nails better than a board-certified dermatologist. The skin is an incredible organ",
        timeAgo: "Posted 2 hours ago",
        likes: 61,
        images: [
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300",
          "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300",
          "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=300",
        ],
        comments: [],
      },
      {
        id: 3,
        author: {
          name: "Dr. Alfredo Botosh",
          username: "alfredo",
          title: "Dermatologist - Apollo Hospital",
          avatar:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
        },
        content:
          "A @Alfredz is a medical doctor who specializes in conditions that affect the skin, hair, and nails.",
        hashtags: ["#inclusive"],
        timeAgo: "Posted 2 hours ago",
        likes: 45,
        comments: [
          {
            author: {
              name: "Rebecca",
              avatar:
                "https://images.unsplash.com/photo-1494790108755-2616b612b1c1?w=150",
            },
            content:
              "Rebecca really cool picture, and the caption gives me goosebumps 😉",
            timeAgo: "4 hours ago",
            likes: 5,
            replies: [
              {
                author: {
                  name: "Tobias Ricky",
                  avatar:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                },
                content: "can i join with you guys? 😊",
                timeAgo: "4 hours ago",
                likes: 8,
              },
              {
                author: {
                  name: "Tobias Ricky",
                  avatar:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                },
                content: "let's go for a holiday together 😊",
                timeAgo: "4 hours ago",
                likes: 12,
              },
            ],
          },
        ],
      },
    ];
    setPosts(samplePosts);
  }, []);

  // Function to handle new posts
  const handleNewPost = (postData) => {
    const newPost = {
      id: Date.now(), // Simple ID generation
      author: {
        name: businessProfile?.orgName || currentUser?.name || "Anonymous",
        username:
          businessProfile?.orgHandle || currentUser?.username || "anonymous",
        title: businessProfile?.orgType || currentUser?.title || "User",
        avatar:
          businessProfile?.orgLogo ||
          currentUser?.profilePicture ||
          "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
      },
      content: postData.content,
      timeAgo: "Just now",
      likes: 0,
      images: postData.images || [],
      comments: [],
      hashtags: postData.hashtags || [],
      type: postData.type || "text", // "text", "poll"
      pollData: postData.pollData || null,
    };

    // Add new post to the beginning of the posts array
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // Function to handle new poll posts
  const handleNewPoll = (pollData) => {
    const newPoll = {
      id: Date.now(),
      author: {
        name: businessProfile?.orgName || currentUser?.name || "Anonymous",
        username:
          businessProfile?.orgHandle || currentUser?.username || "anonymous",
        title: businessProfile?.orgType || currentUser?.title || "User",
        avatar:
          businessProfile?.orgLogo ||
          currentUser?.profilePicture ||
          "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
      },
      content: "Share your knowledge .....",
      timeAgo: "Just now",
      likes: 0,
      comments: [],
      type: "poll",
      pollData: {
        question: pollData.question,
        options: pollData.options.filter((opt) => opt.trim()),
        duration: pollData.duration,
        votes: pollData.options.filter((opt) => opt.trim()).map(() => 0), // Initialize vote counts
        totalVotes: 0,
      },
    };

    setPosts((prevPosts) => [newPoll, ...prevPosts]);
  };

  // Function to handle new case posts
  const handleNewCase = (caseData) => {
    const newCase = {
      id: Date.now(),
      author: {
        name: businessProfile?.orgName || currentUser?.name || "Anonymous",
        username:
          businessProfile?.orgHandle || currentUser?.username || "anonymous",
        title: businessProfile?.orgType || currentUser?.title || "User",
        avatar:
          businessProfile?.orgLogo ||
          currentUser?.profilePicture ||
          "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
      },
      content: caseData.heading || "Share your knowledge .....",
      timeAgo: "Just now",
      likes: 0,
      comments: [],
      type: "case",
      hashtags: ["#inclusive"],
      // Case-specific data
      patientAge: caseData.patientAge,
      patientGender: caseData.patientGender,
      isCritical: caseData.isCritical,
      presentation: caseData.presentation,
      keyFindings: caseData.keyFindings,
      outcome: caseData.outcome,
    };

    setPosts((prevPosts) => [newCase, ...prevPosts]);
  };

  // Function to handle post updates (likes, comments, poll votes)
  const handleUpdatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  // ✅ Same responsive layout logic as messaging pages
  const getResponsiveLayout = () => {
    if (windowWidth <= 1599) {
      return {
        marginLeft: "100px",
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
      };
    } else if (windowWidth <= 1920) {
      return {
        marginLeft: "50px",
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
      };
    } else {
      return {
        marginLeft: "50px",
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
      };
    }
  };

  const layout = getResponsiveLayout();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden pt-[85px]">
        <div
          className="flex flex-1 overflow-y-auto"
          style={{
            marginLeft: layout.marginLeft,
            paddingLeft: layout.paddingLeft,
            paddingRight: layout.paddingRight,
          }}
        >
          <div className="mx-auto w-full max-w-[80rem]">
            <div className="bg-[#E4E5E8] rounded-lg w-full">
              <div
                className="bg-[#F5F7FA]"
                style={{
                  minHeight: "calc(100vh - 100px)",
                  gap: layout.gap,
                  padding: layout.padding,
                }}
              >
                <div className="grid grid-cols-12 gap-6 h-full">
                  {/* Main Feed - Expanded to take more space */}
                  <div className="col-span-8">
                    {/* Tabs */}
                    <FeedTabs
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />

                    {/* Create Post - Conditional based on activeTab */}
                    {activeTab === "feed" ? (
                      <CreatePost
                        userProfile={businessProfile || currentUser}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onNewPost={handleNewPost}
                        onNewPoll={handleNewPoll}
                      />
                    ) : (
                      <CaseCreatePost
                        userProfile={businessProfile || currentUser}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onNewPost={handleNewPost}
                        onNewCase={handleNewCase}
                      />
                    )}

                    {/* Feed Posts - Conditional based on activeTab */}
                    <div className="space-y-4">
                      {activeTab === "feed"
                        ? // Regular Feed Posts
                          posts.map((post) => (
                            <FeedPost
                              key={post.id}
                              post={post}
                              onUpdatePost={handleUpdatePost}
                              currentUserProfile={
                                businessProfile || currentUser
                              }
                            />
                          ))
                        : // Case Posts: render by type
                          posts.map((post) =>
                            post.type === "case" ? (
                              <CasePost
                                key={post.id}
                                post={post}
                                onUpdatePost={handleUpdatePost}
                                currentUserProfile={
                                  businessProfile || currentUser
                                }
                              />
                            ) : (
                              <FeedPost
                                key={post.id}
                                post={post}
                                onUpdatePost={handleUpdatePost}
                                currentUserProfile={
                                  businessProfile || currentUser
                                }
                              />
                            )
                          )}
                    </div>

                    {/* View All Link */}
                    <div className="text-center mt-6">
                      <button
                        className="font-medium hover:opacity-80 transition-opacity"
                        style={{ color: "#1890FF", fontSize: "14px" }}
                      >
                        {activeTab === "feed"
                          ? "View All..."
                          : "View All Cases..."}
                      </button>
                    </div>
                  </div>

                  {/* Right Sidebar - Suggestions */}
                  <div className="col-span-4">
                    <SidebarSuggestions />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterFeedPage;
