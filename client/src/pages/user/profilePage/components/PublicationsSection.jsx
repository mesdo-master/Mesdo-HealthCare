import { useState, useEffect } from "react";
import { Pencil, BookOpen, ChevronRight } from "lucide-react";

const PublicationsSection = ({ isOwnProfile, userData, openModal }) => {
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    setPublications(userData?.publications || []);
  }, [userData?.publications]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Publications</h2>
        {isOwnProfile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => openModal("Extra Information")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {publications.length > 0 ? (
          publications.map((pub, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="bg-blue-100 w-10 h-10 flex justify-center items-center rounded-lg">
                <BookOpen className="text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-medium text-gray-900 mr-2">
                    {pub.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] text-gray-600 mb-1">
                  {pub.issuer && <span>{pub.issuer}</span>}
                  {pub.issuer && pub.date && <span>·</span>}
                  {pub.date && <span>{pub.date}</span>}
                </div>
                {pub.description && (
                  <div className="mt-2 text-[14px] text-gray-600">
                    {pub.description.split("\n").map((line, i) => {
                      const cleanLine = line.replace(/<[^>]*>/g, "").trim();
                      return cleanLine ? (
                        <p key={i} className="mb-1">
                          {cleanLine}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}
                {pub.highlights && pub.highlights.length > 0 && (
                  <div className="mt-2">
                    <ul className="list-disc pl-5 text-[14px] text-gray-600">
                      {pub.highlights.map((highlight, index) => (
                        <li key={index} className="mb-1">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pub.link && (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-blue-500 hover:text-blue-600 inline-flex items-center mt-2"
                  >
                    View publication <ChevronRight className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-[14px] text-gray-600">No publications added yet</p>
        )}
      </div>
    </div>
  );
};

export default PublicationsSection;
