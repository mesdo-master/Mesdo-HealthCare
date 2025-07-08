import { useState } from "react";

const SkillsSpecialization = ({ initialSkills = [], onSaveSkills }) => {
  const [skills, setSkills] = useState(initialSkills);
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      const newSkill = skillInput.trim();
      // Case-insensitive duplicate check
      if (
        !skills.some((skill) => skill.toLowerCase() === newSkill.toLowerCase())
      ) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSkills(skills);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="py-6 px-6">
        <div className="w-full">
          <div className="flex flex-col w-full">
            <input
              type="text"
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              className="w-[600px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
            />

            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-gray-200 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-between w-full">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-[120px] h-[40px] bg-blue-500 text-white text-sm font-small rounded-md hover:bg-blue-600 transition ${
                  isSaving ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSpecialization;