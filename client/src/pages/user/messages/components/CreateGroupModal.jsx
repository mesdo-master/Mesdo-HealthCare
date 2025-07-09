import { useState, useEffect } from "react";
import { Search, X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddGroupModal from "./AddGroupModal";
import NewGroupModal from "./NewGroupModal"; // Import the NewGroupModal component
import axiosInstance from "../../../../lib/axio";
import { useNavigate } from "react-router-dom";

const CreateGroupModal = ({ isOpen, onClose, users, onCreateGroup }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false); // New state for the new group modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Remove local form state management since NewGroupModal handles it now

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // console.log(users);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // const handleCreateGroup = () => {
  //   // Close the new group modal and open the add group modal
  //   setIsNewGroupModalOpen(false);
  //   setShowAddModal(true);
  // };

  const navigate = useNavigate();

  const handleMessageClick = async (username) => {
    try {
      const res = await axiosInstance.post("/chats/initiate", {
        username: username,
      });
      const conversationId = res.data.conversationId;
      navigate(`/messages/${conversationId}`);
      handleClose();
    } catch (error) {
      console.error("Error initiating chat:", error);
    }
  };

  const handleCreateGroup = (group) => {
    console.log("Group created successfully:", group); // Debug log
    onCreateGroup(group);
    setShowSuccess(true);
    setIsNewGroupModalOpen(false);

    // Clear form states after a delay to prevent immediate reset
    setTimeout(() => {
      setIsVisible(false);
      onClose();
      setShowSuccess(false);
      // setGroupName(""); // Clear after modal closes
      // setDescription(""); // Clear after modal closes
    }, 1200);
  };

  const dummyUsers = [
    {
      _id: "507f1f77bcf86cd799439011", // Valid ObjectId format
      name: "Dr. Rajeev Bhatt",
      headline: "Dental Surgeon", // Changed from 'role' to 'headline' to match real users
      profilePicture: "https://randomuser.me/api/portraits/men/32.jpg", // Changed from 'avatar' to 'profilePicture'
    },
    {
      _id: "507f1f77bcf86cd799439012", // Valid ObjectId format
      name: "Dr. Riya Sharma",
      headline: "Cardiologist",
      profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      _id: "507f1f77bcf86cd799439013", // Valid ObjectId format
      name: "Dr. Aman Verma",
      headline: "Orthopedic",
      profilePicture: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      _id: "507f1f77bcf86cd799439014", // Valid ObjectId format
      name: "Dr. Priya Singh",
      headline: "Neurologist",
      profilePicture: "https://randomuser.me/api/portraits/women/46.jpg",
    },
    {
      _id: "507f1f77bcf86cd799439015", // Valid ObjectId format
      name: "Dr. Karannnnn Patel",
      headline: "Pediatrician",
      profilePicture: "https://randomuser.me/api/portraits/men/47.jpg",
    },
  ];

  return (
    <>
      {showSuccess ? (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Group has been created!
            </h3>
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {isVisible && !isGroupModalOpen && !isNewGroupModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-white rounded-lg w-[360px] h-[506px] max-w-md"
                >
                  <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-4">
                      <button onClick={handleClose}>
                        <X size={20} />
                      </button>
                      <h3 className="text-lg font-semibold">New Chat</h3>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 border-b"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-80 pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setIsNewGroupModalOpen(true)} // Open the new group modal
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserPlus size={20} />
                      </div>
                      <span className="font-medium">New Group</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-h-[400px] overflow-y-auto"
                  >
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        onClick={() => handleMessageClick(user.username)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                      >
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">
                            {user.headline}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <NewGroupModal
            isOpen={isNewGroupModalOpen}
            onClose={() => setIsNewGroupModalOpen(false)}
            onCreate={handleCreateGroup}
            users={users && users.length > 0 ? users : dummyUsers}
          />

          <AddGroupModal
            isOpen={isGroupModalOpen}
            onClose={() => setIsGroupModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default CreateGroupModal;
