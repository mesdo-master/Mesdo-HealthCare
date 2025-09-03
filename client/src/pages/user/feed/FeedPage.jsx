import React, { useEffect, useState } from "react";
import FeedTabs from "./components/FeedTabs";
import CreatePost from "./components/CreatePost";
import CaseCreatePost from "./components/CaseCreatePost";
import FeedPost from "./components/FeedPost";
import CasePost from "./components/CasePost";
import SidebarSuggestions from "./components/SidebarSuggestions";
import { useAuth } from "../../../hooks/useAuth";

const FeedPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        comments: [],
      },
    ];
    setPosts(samplePosts);
  }, []);

  const handleNewPost = (postData) => {
    const newPost = {
      id: Date.now(),
      author: {
        name: currentUser?.name || "Anonymous",
        username: currentUser?.username || "anonymous",
        title: currentUser?.title || "User",
        avatar:
          currentUser?.profilePicture ||
          "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
      },
      content: postData.content,
      timeAgo: "Just now",
      likes: 0,
      images: postData.images || [],
      comments: [],
      hashtags: postData.hashtags || [],
      type: postData.type || "text",
      pollData: postData.pollData || null,
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleNewPoll = (pollData) => {
    const newPoll = {
      id: Date.now(),
      author: {
        name: currentUser?.name || "Anonymous",
        username: currentUser?.username || "anonymous",
        title: currentUser?.title || "User",
        avatar:
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
        votes: pollData.options.filter((opt) => opt.trim()).map(() => 0),
        totalVotes: 0,
      },
    };
    setPosts((prev) => [newPoll, ...prev]);
  };

  const handleNewCase = (caseData) => {
    const newCase = {
      id: Date.now(),
      author: {
        name: currentUser?.name || "Anonymous",
        username: currentUser?.username || "anonymous",
        title: currentUser?.title || "User",
        avatar:
          currentUser?.profilePicture ||
          "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
      },
      content: caseData.heading || "Share your knowledge .....",
      timeAgo: "Just now",
      likes: 0,
      comments: [],
      type: "case",
      hashtags: ["#inclusive"],
      patientAge: caseData.patientAge,
      patientGender: caseData.patientGender,
      isCritical: caseData.isCritical,
      presentation: caseData.presentation,
      keyFindings: caseData.keyFindings,
      outcome: caseData.outcome,
    };
    setPosts((prev) => [newCase, ...prev]);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const layout = (() => {
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
  })();

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
                  <div className="col-span-8">
                    <FeedTabs
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />

                    {activeTab === "feed" ? (
                      <CreatePost
                        userProfile={currentUser}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onNewPost={handleNewPost}
                        onNewPoll={handleNewPoll}
                      />
                    ) : (
                      <CaseCreatePost
                        userProfile={currentUser}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onNewPost={handleNewPost}
                        onNewCase={handleNewCase}
                      />
                    )}

                    <div className="space-y-4">
                      {activeTab === "feed"
                        ? posts.map((post) => (
                            <FeedPost
                              key={post.id}
                              post={post}
                              onUpdatePost={handleUpdatePost}
                              currentUserProfile={currentUser}
                            />
                          ))
                        : posts.map((post) =>
                            post.type === "case" ? (
                              <CasePost
                                key={post.id}
                                post={post}
                                onUpdatePost={handleUpdatePost}
                                currentUserProfile={currentUser}
                              />
                            ) : (
                              <FeedPost
                                key={post.id}
                                post={post}
                                onUpdatePost={handleUpdatePost}
                                currentUserProfile={currentUser}
                              />
                            )
                          )}
                    </div>

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

export default FeedPage;
