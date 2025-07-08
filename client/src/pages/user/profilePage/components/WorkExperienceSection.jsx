import { Briefcase, Pencil, PlusIcon } from "lucide-react";

function WorkExperienceSection({ experiences = [], onEdit, onAddNew }) {
  return (
    <div className="max-w-3xl mx-auto p-4">
      {" "}
      {/* Reduced from p-6 to p-4 */}
      <div className="space-y-3">
        {" "}
        {/* Reduced from space-y-4 to space-y-3 */}
        {experiences.map((exp) => (
          <div key={exp.id} className="  rounded-lg shadow-sm p-4 bg-gray-50">
            {" "}
            {/* Reduced from p-4 to p-3 */}
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                {" "}
                {/* Reduced from gap-3 to gap-2 */}
                <Briefcase className="w-5 h-5 text-blue-500 mt-1" />{" "}
                {/* Smaller icon */}
                <div>
                  <h3 className="font-semibold">{exp.title}</h3>
                  <p className="text-xs text-gray-600">{exp.location}</p>{" "}
                  {/* Smaller text */}
                  <p className="text-xs text-gray-600">{exp.institution}</p>
                  <p className="text-xs text-gray-500">
                    {exp.startDate} -{" "}
                    {exp.currentlyWorking ? "Present" : exp.endDate}
                  </p>
                  {/* Description */}
                  {exp.description && (
                    <div className="mt-1 text-sm text-gray-700">
                      {exp.description.split("\n").map((line, i) => {
                        // Remove HTML tags and render as plain text
                        const cleanLine = line.replace(/<[^>]*>/g, "").trim();
                        return cleanLine ? (
                          <p key={i} className="mb-1">
                            {cleanLine}
                          </p>
                        ) : null;
                      })}
                    </div>
                  )}
                  {/* Tags */}
                  <div className="flex gap-1 mt-1">
                    {" "}
                    {/* Reduced spacing */}
                    {exp.tags &&
                      exp.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onEdit(exp)}
                className="text-gray-400 hover:text-gray-600 p-1"
              ></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkExperienceSection;
