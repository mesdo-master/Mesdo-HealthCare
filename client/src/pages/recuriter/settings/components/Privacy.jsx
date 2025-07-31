// Recruiter Privacy Settings - based on user Privacy.jsx
import React, { useEffect, useState } from "react";
import { getRecruiterSettings, saveRecruiterSettings } from "./settingsService";

const dropdownOptions = {
  whoCanFollow: ["Everyone", "Only recruiters", "No one"],
  invitationsFromCandidates: [
    "Allow direct connection requests",
    "Only allow from applicants",
    "Do not allow any invitations",
  ],
  messagingAccess: [
    "Only allow messages from applicants",
    "Allow messages from anyone",
    "No one",
  ],
  candidateDataVisibility: ["All recruiters", "Only my company", "No one"],
};

const Privacy = () => {
  // Dropdown states
  const [whoCanFollow, setWhoCanFollow] = useState(
    dropdownOptions.whoCanFollow[0]
  );
  const [invitationsFromCandidates, setInvitationsFromCandidates] = useState(
    dropdownOptions.invitationsFromCandidates[0]
  );
  const [messagingAccess, setMessagingAccess] = useState(
    dropdownOptions.messagingAccess[0]
  );
  const [candidateDataVisibility, setCandidateDataVisibility] = useState(
    dropdownOptions.candidateDataVisibility[0]
  );

  // Toggle states
  const [publicCompany, setPublicCompany] = useState(true);
  const [allowIndex, setAllowIndex] = useState(true);
  const [viewedBadge, setViewedBadge] = useState(true);
  const [focusedInbox, setFocusedInbox] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [harmfulDetection, setHarmfulDetection] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      // const data = await getRecruiterSettings();
      // TODO: Load real data here
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // await saveRecruiterSettings({ ... });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Dropdown component
  const Dropdown = ({ value, setValue, options }) => (
    <select
      className="w-full md:w-[320px] border border-gray-100 rounded-xl px-4 py-2 bg-[#F8FAFC] text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      disabled={isSaving}
    >
      {options.map((option) => (
        <option key={option} value={option} className="text-sm">
          {option}
        </option>
      ))}
    </select>
  );

  // Toggle component
  const Toggle = ({ enabled, setEnabled }) => (
    <button
      type="button"
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shadow-sm ${
        enabled ? "bg-blue-400" : "bg-gray-200"
      }`}
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
      disabled={isSaving}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="bg-[#F7F9FB] min-h-screen py-8 px-2 md:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-md p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg px-8 py-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Your Privacy Settings
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please update your privacy settings preferences here
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          style={{
            background:
              "linear-gradient(90deg, rgba(24,144,255,1) 0%, rgba(0,106,204,1) 100%)",
          }}
        >
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        {/* Who can reach you */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Who can reach you
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <label className="w-full md:w-56 text-gray-600 font-normal text-sm">
                Who can follow you?
              </label>
              <Dropdown
                value={whoCanFollow}
                setValue={setWhoCanFollow}
                options={dropdownOptions.whoCanFollow}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <label className="w-full md:w-56 text-gray-600 font-normal text-sm">
                Invitations from Candidates
              </label>
              <Dropdown
                value={invitationsFromCandidates}
                setValue={setInvitationsFromCandidates}
                options={dropdownOptions.invitationsFromCandidates}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <label className="w-full md:w-56 text-gray-600 font-normal text-sm">
                Messaging Access
              </label>
              <Dropdown
                value={messagingAccess}
                setValue={setMessagingAccess}
                options={dropdownOptions.messagingAccess}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <label className="w-full md:w-56 text-gray-600 font-normal text-sm">
                Candidate Data Visibility
              </label>
              <Dropdown
                value={candidateDataVisibility}
                setValue={setCandidateDataVisibility}
                options={dropdownOptions.candidateDataVisibility}
              />
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-100" />

        {/* Company Visibility */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Company Visibility
          </h3>
          <div className="flex flex-col gap-3 ml-[0] md:ml-[235px] w-full md:w-[450px]">
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-gray-700 text-sm">
                Publicly display company profile
              </span>
              <Toggle enabled={publicCompany} setEnabled={setPublicCompany} />
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-gray-700 text-sm">
                Allow third-party search engines to index
              </span>
              <Toggle enabled={allowIndex} setEnabled={setAllowIndex} />
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-gray-700 text-sm">
                Enable "Viewed" badge for candidate profiles
              </span>
              <Toggle enabled={viewedBadge} setEnabled={setViewedBadge} />
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-100" />

        {/* Messages */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3">Messages</h3>
          <div className="flex flex-col gap-3 ml-[0] md:ml-[235px] w-full md:w-[450px]">
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-gray-700 text-sm">Focused Inbox</span>
              <Toggle enabled={focusedInbox} setEnabled={setFocusedInbox} />
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-gray-700 text-sm">
                Read receipts and typing indicator
              </span>
              <Toggle enabled={readReceipts} setEnabled={setReadReceipts} />
            </div>
            <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-4 py-3 shadow-sm">
              <span className="text-gray-700 text-sm">
                Automatic detection of harmful content
              </span>
              <Toggle
                enabled={harmfulDetection}
                setEnabled={setHarmfulDetection}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
