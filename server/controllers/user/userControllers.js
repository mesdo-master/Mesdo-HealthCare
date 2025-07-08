const User = require('../../models/user/User')
const cloudinary = require('../../config/cloudinary');
// const { sendNotification } = require('../../utils/notificationService');

const getProfileInfo = async (req, res) => {
    try {
        const { username } = req.body;
        console.log('Username:', username)

        // Check if username is provided
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required.',
                redirectUrl: '/'
            });
        }

        // Fetch the user profile from the database
        const foundUser = await User.findOne({ username });

        // Check if user is found
        if (!foundUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
                redirectUrl: '/'
            });
        }

        // Return the user profile information
        return res.status(200).json({
            success: true,
            message: 'User profile fetched successfully.',
            foundUser,
        });
    } catch (error) {
        console.error("Error in getProfileInfo:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later.',
        });
    }
};

const updateUserInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedProfile = req.body;
        let transformedProfile = updatedProfile;

        if (updatedProfile.city && updatedProfile.state) {
            transformedProfile['location.city'] = updatedProfile.city;
            transformedProfile['location.state'] = updatedProfile.state;
            delete transformedProfile.city;
            delete transformedProfile.state;
        }
        console.log(transformedProfile)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: transformedProfile },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Profile updated successfully', updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

const updateProfilePic = async (req, res) => {
    try {
        // Authentication and input validation
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        if (!req.file || !req.file.path || !req.file.filename) {
            return res.status(400).json({ message: 'Bad Request: No file uploaded' });
        }

        const prevPublicId = req.user.profilePictureId;
        const userId = req.user._id;
        const fileUrl = req.file.path;
        const publicId = req.file.filename;

        // File size validation (max 5MB example)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
        if (req.file.size > MAX_FILE_SIZE) {
            await cloudinary.uploader.destroy(publicId);
            return res.status(400).json({
                message: `File too large. Maximum size allowed is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }


        // Delete previous image if it exists
        if (prevPublicId) {
            try {
                const destroyResult = await cloudinary.uploader.destroy(prevPublicId);
                if (destroyResult.result !== 'ok') {
                    console.warn('Previous profile picture deletion warning:', destroyResult);
                }
                console.log('Previous profile picture deleted successfully');
            } catch (error) {
                console.error('Error deleting previous profile picture:', error);
                // Continue even if deletion fails
            }
        }

        // Update user's profile picture in database
        const user = await User.findByIdAndUpdate(
            userId,
            {
                profilePicture: fileUrl,
                profilePictureId: publicId,
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            // Cleanup on failure
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (cleanupError) {
                console.error('Cleanup error after failed update:', cleanupError);
            }
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'Profile picture uploaded successfully',
            data: {
                profilePicUrl: fileUrl,
                profilePicId: publicId,
            }
        });

    } catch (error) {
        // Detailed error logging
        console.error('Error in updateProfilePic:', {
            message: error.message,
            stack: error.stack,
            userId: req?.user?._id,
            fileInfo: req?.file && {
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });

        // Cleanup uploaded file on error
        if (req?.file?.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log('Cleaned up failed profile picture upload');
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }

        // Specific error responses
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                details: error.errors
            });
        }

        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).json({
                message: 'Database conflict error'
            });
        }

        return res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateCoverPic = async (req, res) => {
    try {
        // Check if required data exists
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        if (!req.file || !req.file.path || !req.file.filename) {
            return res.status(400).json({ message: 'Bad Request: No file uploaded' });
        }

        const prevPublicId = req.user.BannerId;
        const userId = req.user._id;
        const fileUrl = req.file.path;
        const publicId = req.file.filename;


        // Delete previous image if it exists
        if (prevPublicId) {
            try {
                const destroyResult = await cloudinary.uploader.destroy(prevPublicId);
                if (destroyResult.result !== 'ok') {
                    console.warn('Previous image deletion warning:', destroyResult);
                }
                console.log('Previous image deleted successfully');
            } catch (error) {
                console.error('Error deleting previous image:', error);
                // Don't throw error here - proceed with update even if deletion fails
            }
        }

        // Update the user's cover picture in the database
        const user = await User.findByIdAndUpdate(
            userId,
            {
                Banner: fileUrl,
                BannerId: publicId,
                updatedAt: Date.now() // Add timestamp for tracking
            },
            {
                new: true, // Return updated document
                runValidators: true // Ensure schema validation
            }
        );

        if (!user) {
            // Clean up uploaded file if user update fails
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (cleanupError) {
                console.error('Cleanup error after failed update:', cleanupError);
            }
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'Cover picture uploaded successfully',
            data: {
                Banner: fileUrl,
                BannerId: publicId,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        // Detailed error handling
        console.error('Error in updateCoverPic:', {
            message: error.message,
            stack: error.stack,
            userId: req?.user?._id
        });

        // Clean up uploaded file if it exists
        if (req?.file?.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log('Cleaned up failed upload');
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }

        // Specific error responses
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                details: error.errors
            });
        }

        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).json({
                message: 'Database conflict error'
            });
        }

        return res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const fetchExperiences = async (req,res) => {
    try {
        const userId = req.user._id;
        // console.log("fetchExperiences",userId);
        // Fetch user with experiences
        const user = await User.findById(userId).select("experience");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({
            success: true,
            experiences: user.experience || [],
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
}

const fetchQualifications = async (req,res) => {
    try {
        const userId = req.user._id;
        // console.log("fetchExperiences",userId);
        // Fetch user with experiences
        const user = await User.findById(userId).select("education");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({
            success: true,
            educations: user.education || [],
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
}


const handleUploads = async (req, res) => {
    const file = req.file; 

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
        message: `picture uploaded successfully`,
        url: file.path,
    });
}

const getConnections = async (req, res) => {
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId).populate('connections', 'name username profilePicture headline'); // include desired fields

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      connections: user.connections,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {getConnections,handleUploads, getProfileInfo, updateUserInfo, updateProfilePic, updateCoverPic, fetchExperiences,fetchQualifications };
