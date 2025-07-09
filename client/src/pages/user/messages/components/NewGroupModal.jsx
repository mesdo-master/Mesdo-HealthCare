import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Link as LinkIcon, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Add proper import
import axiosInstance from "../../../../lib/axio"; // Add axios import

const NewGroupModal = ({ isOpen, onClose, onCreate, users }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);

  // Manage form state locally to prevent parent interference
  const [localGroupName, setLocalGroupName] = useState("");
  const [localDescription, setLocalDescription] = useState("");

  const navigate = useNavigate(); // Use proper navigate hook

  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      setStep(1);
      setSelectedMembers([]);
      setSearch("");
      // Don't reset local form states here to prevent form clearing
      setShowSuccess(false);
      setIsSubmitting(false);

      // Debug logging
      console.log("NewGroupModal opened with users:", users);
      console.log("Users length:", users?.length);
    }
  }, [isOpen, users]); // Add users to dependency array

  if (!isOpen) return null;

  // Filter users by search query
  const filteredUsers = (users || []).filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  console.log("Filtered users:", filteredUsers); // Debug log

  const handleToggleMember = (id) => {
    console.log("Toggling member with ID:", id); // Debug log
    console.log("Current selected members:", selectedMembers); // Debug log

    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedMembers.length >= 2) setStep(2); // Changed back to 2 members minimum
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      // Reset form states only when manually closing
      setStep(1);
      setSelectedMembers([]);
      setSearch("");
      setLocalGroupName("");
      setLocalDescription("");
    }, 300);
  };

  // Improved handleCreate: actual API call with proper error handling
  const handleCreate = async () => {
    if (!localGroupName.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: localGroupName.trim(),
        description: localDescription.trim(),
        participantIds: selectedMembers,
      };

      console.log("Creating group with payload:", payload); // Debug log
      console.log("selectedMembers type:", typeof selectedMembers);
      console.log("selectedMembers value:", selectedMembers);
      console.log(
        "selectedMembers array check:",
        Array.isArray(selectedMembers)
      );

      // Actual API call to backend
      const response = await axiosInstance.post("/chats/createGroup", payload);
      const newGroup = response.data;

      console.log("Group created successfully:", newGroup); // Debug log

      // Notify parent of new group
      onCreate(newGroup);
      setShowSuccess(true);

      // Close modal and navigate after success message
      setTimeout(() => {
        setShowSuccess(false);
        setIsVisible(false);
        onClose();
        navigate(`/messages/${newGroup._id}`);
      }, 1500); // Slightly longer delay to show success message
    } catch (error) {
      console.error("Error creating group:", error);
      console.error("Error response:", error.response?.data);
      // Show error message to user
      alert("Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success feedback overlay
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-lg shadow-lg px-8 py-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-3" />
          </motion.div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">
            Group has been created!
          </h3>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`bg-white rounded-lg ${
              step === 1 ? "w-[360px] h-[506px]" : "w-full max-w-md"
            } flex flex-col`}
          >
            {/* Step 1: Select members */}
            {step === 1 && (
              <>
                {/* Top Bar */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 border-b"
                >
                  <button
                    onClick={handleClose}
                    className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-semibold">New Group</h2>
                </motion.div>

                {/* Search Bar */}
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
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none text-sm"
                    />
                  </div>
                </motion.div>

                {/* Add Members Button */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="px-4 pb-4"
                >
                  <button
                    onClick={handleContinue}
                    disabled={selectedMembers.length < 2} // Changed back to 2
                    className={`w-full flex items-center justify-center gap-2 font-medium rounded-lg h-10 text-sm transition-all duration-150 ${
                      selectedMembers.length >= 2 // Changed back to 2
                        ? "bg-[#1890FF] text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {selectedMembers.length === 0
                      ? "Select at least 2 members"
                      : selectedMembers.length === 1
                      ? "Select 1 more member"
                      : `Continue with ${selectedMembers.length} Members`}
                  </button>
                </motion.div>

                {/* User List */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 overflow-y-auto max-h-[400px]"
                >
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {search ? "No users found" : "No users available"}
                    </div>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => handleToggleMember(user._id)}
                        className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/40x40?text=User";
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">
                            {user.headline}
                          </p>
                        </div>
                        {/* Custom Checkbox */}
                        <div
                          className={`w-6 h-6 flex items-center justify-center rounded border-2 transition-all duration-150 ${
                            selectedMembers.includes(user._id)
                              ? "border-[#1890FF] bg-blue-50"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selectedMembers.includes(user._id) && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              width="14"
                              height="14"
                              fill="none"
                              stroke="#1890FF"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </motion.svg>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </>
            )}

            {/* Step 2: Enter group details */}
            {step === 2 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 flex items-center gap-4 border-b"
                >
                  <button
                    onClick={() => setStep(1)}
                    className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-semibold">Group Details</h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <LinkIcon className="text-blue-500" size={20} />
                    </div>
                    <span className="text-gray-500 text-sm">
                      Add Group Icon{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-sm">
                      Group Name
                    </label>
                    <input
                      type="text"
                      placeholder="Group name"
                      value={localGroupName}
                      onChange={(e) => setLocalGroupName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium text-sm">
                      Group Description
                    </label>
                    <textarea
                      placeholder="Description"
                      value={localDescription}
                      onChange={(e) => setLocalDescription(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 h-24 resize-none text-sm"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 flex gap-3"
                >
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!localGroupName.trim() || isSubmitting}
                    className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                      localGroupName.trim() && !isSubmitting
                        ? "bg-[#1890FF] hover:bg-blue-700"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Creating..." : "Create"}
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewGroupModal;
