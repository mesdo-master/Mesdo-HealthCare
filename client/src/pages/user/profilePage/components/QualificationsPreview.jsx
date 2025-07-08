import { Trash2, Plus, GraduationCap, Pencil } from "lucide-react";

const QualificationsPreview = ({ qualifications, onEdit, onDelete }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Qualifications ({qualifications.length})
        </h3>
        <button
          onClick={() => onEdit(null)}
          className="flex items-center gap-2 text-[#1890FF] hover:text-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="space-y-6">
        {qualifications.map((q, idx) => (
          <div
            key={q.id || idx}
            className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mt-1">
              <GraduationCap className="w-6 h-6 text-[#1890FF]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-lg text-gray-900 mb-1">
                    {q.qualification}
                    {q.course && ` and a ${q.course}`}
                    {q.specialization && ` (${q.specialization})`}
                  </h4>
                  <div className="text-sm text-gray-600 mb-2">
                    {q.university}
                    {q.location && ` | ${q.location}`}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {q.passingYear && `${q.passingYear}`}
                    {q.startDate && q.passingYear && ` - `}
                    {q.endDate && q.endDate}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onEdit(q)}
                    className="text-gray-400 hover:text-[#1890FF] p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    aria-label="Edit qualification"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(q.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                    aria-label="Delete qualification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {q.description && (
                <div className="text-sm text-gray-700 leading-relaxed mb-3">
                  {q.description.split("\n").map((line, i) => {
                    const cleanLine = line.replace(/<[^>]*>/g, "").trim();
                    return cleanLine ? (
                      <p key={i} className="mb-1">
                        • {cleanLine}
                      </p>
                    ) : null;
                  })}
                </div>
              )}

              {q.skills && q.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {q.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {qualifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              No qualifications added yet
            </p>
            <p className="text-gray-600 mb-4">
              Add your educational background and academic achievements
            </p>
            <button
              onClick={() => onEdit(null)}
              className="bg-[#1890FF] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              Add Your First Qualification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualificationsPreview;
