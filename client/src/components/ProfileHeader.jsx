import React, { useState } from 'react';
import {
    Camera,
    MapPin,
    Pencil,
    UserPlus,
    MessageCircle,
    Users,
    // Share2,
    // MoreHorizontal,
    // Flag,
    // UserX,
    // ExternalLink,
    Check,
    X
} from 'lucide-react';
import axiosInstance from '../lib/axio';
import { useAuth } from '../context/AuthContext';


const ProfileHeader = ({ userData, isOwnProfile, onSave }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(userData);
    // const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('none'); // none, pending, connected, received
    const [isFollowing, setIsFollowing] = useState(false);
    const { setCurrentUser } = useAuth();


    const handleImageUpload = async (e) => {
        const profilePic = e.target.files[0];

        if (!profilePic) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('profilePic', profilePic);

        try {
            const response = await axiosInstance.post('/users/upload-profile-pic', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Override for file uploads
                },
            });
            setCurrentUser(prevState => ({
                ...prevState,
                profilePicture: response.data.profilePicUrl
            }))
            setEditedProfile(prevState => ({
                ...prevState,
                profilePicture: response.data.profilePicUrl
            }))
            alert('Profile picture updated successfully!');
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to update profile picture.');
        }
    }

    const handleSave = () => {
        onSave(editedProfile);
        setIsEditing(false);
    };

    const handleConnect = () => {
        switch (connectionStatus) {
            case 'none':
                setConnectionStatus('pending');
                break;
            case 'pending':
                setConnectionStatus('none');
                break;
            case 'received':
                setConnectionStatus('connected');
                break;
            case 'connected':
                setConnectionStatus('none');
                break;
            default:
                console.warn('Unexpected connectionStatus:', connectionStatus);
                break;
        }
    };


    const handleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    const handleDecline = () => {
        setConnectionStatus('none');
    };

    const renderConnectionButton = () => {
        switch (connectionStatus) {
            case 'none':
                return (
                    <button
                        onClick={handleConnect}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Connect</span>
                    </button>
                );
            case 'pending':
                return (
                    <button
                        onClick={handleConnect}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        <Check className="w-4 h-4" />
                        <span>Pending</span>
                    </button>
                );
            case 'received':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleConnect}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                        </button>
                        <button
                            onClick={handleDecline}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                        </button>
                    </div>
                );
            case 'connected':
                return (
                    <button
                        onClick={handleConnect}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        <Users className="w-4 h-4" />
                        <span>Connected</span>
                    </button>
                );
            default:
                return (
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md"
                        disabled
                    >
                        <span>Unknown Status</span>
                    </button>
                );
        }
    };


    return (
        <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            {/* Banner */}
            <div className="relative h-60 bg-gradient-to-r from-blue-500 to-blue-600">

                <img
                    src={userData.Banner || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809'}
                    alt="Profile Banner"
                    className="w-full h-full object-cover"
                />

                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Camera className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Avatar */}
            <div className="absolute left-8 transform -translate-y-1/2" style={{ top: '14rem' }}>
                <div className="relative">
                    <img
                        src={userData.profilePicture || 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg'}
                        alt={userData.name}
                        className="w-40 h-40 rounded-full border-4 border-white shadow-lg"
                    />
                    {isOwnProfile && (
                        <>
                            <label
                                htmlFor="avatarImageUpload"
                                className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer flex items-center justify-center"
                            >
                                <Camera className="w-5 h-5 text-gray-600" />
                            </label>
                            <input
                                id="avatarImageUpload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </>
                    )}
                </div>
            </div>


            {/* Profile Info */}
            <div className="px-8 pb-8 pt-24">
                {isEditing ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                            className="text-3xl font-bold w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={editedProfile.headline}
                            onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })}
                            className="text-xl text-gray-600 w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={editedProfile.location.city || ''}
                                onChange={(e) =>
                                    setEditedProfile({
                                        ...editedProfile,
                                        location: {
                                            ...editedProfile.location,
                                            city: e.target.value,
                                        },
                                    })
                                }
                                className="text-gray-600 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                placeholder="City"
                            />

                            <input
                                type="text"
                                value={editedProfile.location.state || ''}
                                onChange={(e) =>
                                    setEditedProfile({
                                        ...editedProfile,
                                        location: {
                                            ...editedProfile.location,
                                            state: e.target.value,
                                        },
                                    })
                                }
                                className="text-gray-600 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                placeholder="State"
                            />

                            <input
                                type="text"
                                value={editedProfile.location.country || ''}
                                onChange={(e) =>
                                    setEditedProfile({
                                        ...editedProfile,
                                        location: {
                                            ...editedProfile.location,
                                            country: e.target.value,
                                        },
                                    })
                                }
                                className="text-gray-600 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                placeholder="Country"
                            />

                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">{userData.name}</h1>
                                <p className="text-xl text-gray-600">{userData.headline}</p>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <MapPin className="w-5 h-5" />
                                    <span>{userData.location.city},{userData.location.state}, {userData.location.country}</span>
                                </div>
                                {/* <p className="text-gray-600 mt-2">{userData.about}</p> */}

                                {/* Stats */}
                                <div className="flex space-x-6 mt-4 text-sm">
                                    <button className="hover:text-blue-600">
                                        <span className="font-semibold">{userData.connections.length}</span> connections
                                    </button>
                                    <button className="hover:text-blue-600">
                                        <span className="font-semibold">{userData.followers.length}</span> followers
                                    </button>
                                    <button className="hover:text-blue-600">
                                        <span className="font-semibold">{userData.following.length}</span> following
                                    </button>
                                </div>

                                {/* Activity Metrics */}
                                {/* <div className="flex space-x-6 mt-2 text-sm text-gray-500">
                      <span>{stats.posts} posts</span>
                      <span>{stats.endorsements} endorsements</span>
                    </div> */}
                            </div>

                            {/* Action Buttons */}

                            <div className="flex items-center space-x-2">

                                {!isOwnProfile && (
                                    <>
                                        {renderConnectionButton()}

                                        <button
                                            onClick={() => { }}
                                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span>Message</span>
                                        </button>

                                        <button
                                            onClick={handleFollow}
                                            className={`flex items-center space-x-2 px-4 py-2 ${isFollowing
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                } rounded-md`}
                                        >
                                            <span>{isFollowing ? 'Following' : 'Follow'}</span>
                                        </button>
                                    </>
                                )}


                                {/* <div className="relative">
                                    <button
                                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>

                                    {showMoreMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                            <button
                                                onClick={() => { }}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <Share2 className="w-4 h-4" />
                                                <span>Share Profile</span>
                                            </button>
                                            <button
                                                onClick={() => { }}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <Flag className="w-4 h-4" />
                                                <span>Report</span>
                                            </button>
                                            <button
                                                onClick={() => { }}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <UserX className="w-4 h-4" />
                                                <span>Block</span>
                                            </button>
                                            <button
                                                onClick={() => { }}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span>Copy Profile URL</span>
                                            </button>
                                        </div>
                                    )}
                                </div> */}

                                {isOwnProfile && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileHeader