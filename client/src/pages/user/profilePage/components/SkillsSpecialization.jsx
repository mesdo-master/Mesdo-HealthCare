import { useState } from "react";
import { X } from "lucide-react";

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
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Skills ({skills.length})
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Add Skills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={addSkill}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] outline-none transition-all duration-200"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center text-sm font-medium border hover:bg-gray-200 transition-colors"
            >
              {skill}
              <button
                onClick={() => removeSkill(index)}
                className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No skills added yet. Add your first skill above.</p>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-3 bg-[#1890FF] text-white rounded-xl font-medium transition-all duration-200 shadow-lg ${
              isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsSpecialization;
