import React, { useState } from "react";
import { MapPin, Phone, Mail, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProfileModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("Media");
  const [isMediaExpanded, setIsMediaExpanded] = useState(true);
  const [isInterestsExpanded, setIsInterestsExpanded] = useState(false);

  const profile = {
    name: "Dr. Rajeev Bhatt",
    title: "Cardiologist",
    hospital: "Apollo Hospital",
    location: "Bangalore, India",
    phone: "123XXXX789",
    email: "abc@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
    media: Array(6).fill(
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=300&fit=crop"
    ),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl flex overflow-hidden">
        {/* Left Section - Profile Info */}
        <div className="w-[400px] p-8 bg-white flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-600 mt-1">
            {profile.title} | {profile.hospital}
          </p>

          <div className="w-full mt-8 space-y-6">
            <div className="flex items-center gap-3">
              <MapPin className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900">{profile.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="text-gray-900">{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Media & Interests */}
        <div className="flex-1 bg-gray-50 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          {/* Media Section */}
          <div className="mb-6">
            <button
              onClick={() => setIsMediaExpanded(!isMediaExpanded)}
              className="flex items-center justify-between w-full text-xl font-semibold text-gray-900 mb-4"
            >
              <span>Media</span>
              {isMediaExpanded ? (
                <ChevronUp size={24} />
              ) : (
                <ChevronDown size={24} />
              )}
            </button>

            {/* Tabs */}
            {isMediaExpanded && (
              <>
                <div className="flex gap-4 mb-6">
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "Media"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("Media")}
                  >
                    Media
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "PDF"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("PDF")}
                  >
                    PDF
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "Links"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("Links")}
                  >
                    Links
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {profile.media.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                    >
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Interests Section */}
          <div>
            <button
              onClick={() => setIsInterestsExpanded(!isInterestsExpanded)}
              className="flex items-center justify-between w-full text-xl font-semibold text-gray-900 mb-4"
            >
              <span>Interests</span>
              {isInterestsExpanded ? (
                <ChevronUp size={24} />
              ) : (
                <ChevronDown size={24} />
              )}
            </button>

            {isInterestsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cardiology",
                    "Research",
                    "Medical Education",
                    "Healthcare Technology",
                  ].map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;