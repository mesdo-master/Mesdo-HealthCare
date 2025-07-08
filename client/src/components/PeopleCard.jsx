import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, UserPlus } from "lucide-react";

const PeopleCard = ({ user }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleUserClick}
    >
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <img
            src={
              user.profilePicture ||
              "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
            }
            alt={`${user.name}'s profile`}
            className="w-16 h-16 rounded-full object-cover border border-gray-200"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.name || "User Name"}
              </h3>

              {user.headline && (
                <p className="text-sm text-gray-600 mt-1">{user.headline}</p>
              )}

              {user.about && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {user.about}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {user.location.city && user.location.state
                        ? `${user.location.city}, ${user.location.state}`
                        : user.location.city ||
                          user.location.state ||
                          user.location}
                    </span>
                  </div>
                )}

                {user.currentPosition && (
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{user.currentPosition}</span>
                  </div>
                )}
              </div>

              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {user.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{user.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Connect Button */}
            <div className="flex-shrink-0 ml-4">
              <button
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle connect logic here
                  console.log("Connect with user:", user.name);
                }}
              >
                <UserPlus className="w-4 h-4" />
                <span>Connect</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleCard;
