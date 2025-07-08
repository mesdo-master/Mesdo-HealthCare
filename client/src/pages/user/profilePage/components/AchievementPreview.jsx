import React from "react";
import { Award, Edit, Plus, Trash2, Pencil } from "lucide-react";

const AchievementPreview = ({ achievements = [], onEdit, onDelete, onAdd }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Awards & Achievements
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-[#1890FF] hover:text-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="space-y-6">
        {achievements.length > 0 ? (
          achievements.map((achievement, idx) => (
            <div
              key={achievement.id || idx}
              className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mt-1">
                <Award className="w-6 h-6 text-[#1890FF]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg text-gray-900 mb-1">
                      {achievement.title}
                    </h4>
                    <div className="text-sm text-gray-600 mb-2">
                      {achievement.issuer &&
                        `Issued by - ${achievement.issuer}`}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {achievement.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onEdit(achievement)}
                      className="text-gray-400 hover:text-[#1890FF] p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      aria-label="Edit achievement"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(achievement.id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                      aria-label="Delete achievement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {achievement.description && (
                  <div className="text-sm text-gray-700 leading-relaxed mb-3">
                    {achievement.description.split("\n").map((line, i) => {
                      const cleanLine = line.replace(/<[^>]*>/g, "").trim();
                      return cleanLine ? (
                        <p key={i} className="mb-1">
                          • {cleanLine}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}

                {achievement.highlights &&
                  achievement.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {achievement.highlights.map((highlight, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-xs font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              No achievements added yet
            </p>
            <p className="text-gray-600 mb-4">
              Highlight your accomplishments and recognition
            </p>
            <button
              onClick={onAdd}
              className="bg-[#1890FF] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              Add Your First Achievement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPreview;
