import { useState, useEffect } from "react";
import {
  BookOpen,
  Edit,
  PlusCircle,
  Trash2,
  X,
  Pencil,
  Plus,
} from "lucide-react";
import PublicationForm from "./PublicationForm";

const ExtraInformation = ({
  initialLanguages = [],
  initialPublications = [],
  onSave,
  onCancel,
}) => {
  const [languages, setLanguages] = useState(initialLanguages);
  const [publications, setPublications] = useState(initialPublications);
  const [languageInput, setLanguageInput] = useState("");
  const [editingPublication, setEditingPublication] = useState(null);
  const [showPublicationForm, setShowPublicationForm] = useState(false);

  // Sync with parent's initial data
  useEffect(() => {
    setLanguages(initialLanguages);
    setPublications(initialPublications);
  }, [initialLanguages, initialPublications]);

  // Language functions
  const addLanguage = (e) => {
    if (e.key === "Enter" && languageInput.trim()) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  // Publication functions
  const handleSavePublication = (publicationData) => {
    if (editingPublication) {
      // Update existing publication
      setPublications(
        publications.map((pub) =>
          pub === editingPublication ? publicationData : pub
        )
      );
    } else {
      // Add new publication
      setPublications([...publications, publicationData]);
    }
    setEditingPublication(null);
    setShowPublicationForm(false);
  };

  const handleEditPublication = (pub) => {
    setEditingPublication(pub);
    setShowPublicationForm(true);
  };

  const handleDeletePublication = (index) => {
    setPublications(publications.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onSave({
      languages,
      publications,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {showPublicationForm ? (
          <PublicationForm
            achievement={editingPublication}
            onSave={handleSavePublication}
            onCancel={() => {
              setEditingPublication(null);
              setShowPublicationForm(false);
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Languages Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Language ({languages.length})
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Add Language"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyDown={addLanguage}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] outline-none transition-all duration-200"
                />

                <div className="flex flex-wrap gap-3">
                  {languages.map((language, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center text-sm font-medium border hover:bg-gray-200 transition-colors"
                    >
                      {language}
                      <button
                        onClick={() => removeLanguage(index)}
                        className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Publications Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Publishings ({publications.length})
                </h3>
                <button
                  onClick={() => {
                    setEditingPublication(null);
                    setShowPublicationForm(true);
                  }}
                  className="bg-[#1890FF] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Publication
                </button>
              </div>

              <div className="space-y-6">
                {publications.length > 0 ? (
                  publications.map((pub, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mt-1">
                        <BookOpen className="w-6 h-6 text-[#1890FF]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg text-gray-900 mb-1">
                              {pub.title}
                            </h4>
                            <div className="text-sm text-gray-600 mb-2">
                              {pub.issuer}
                            </div>
                            <div className="text-sm text-gray-500 mb-3">
                              {pub.date}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditPublication(pub)}
                              className="text-gray-400 hover:text-[#1890FF] p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              aria-label="Edit publication"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePublication(index)}
                              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                              aria-label="Delete publication"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {pub.description && (
                          <div className="text-sm text-gray-700 leading-relaxed mb-3">
                            {pub.description.split("\n").map((line, i) => {
                              const cleanLine = line
                                .replace(/<[^>]*>/g, "")
                                .trim();
                              return cleanLine ? (
                                <p key={i} className="mb-1">
                                  • {cleanLine}
                                </p>
                              ) : null;
                            })}
                          </div>
                        )}

                        {pub.highlights?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {pub.highlights.map((highlight, i) => (
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
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      No publications added yet
                    </p>
                    <p className="text-gray-600 mb-4">
                      Add your research papers, articles, and publications
                    </p>
                    <button
                      onClick={() => {
                        setEditingPublication(null);
                        setShowPublicationForm(true);
                      }}
                      className="bg-[#1890FF] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
                    >
                      Add Your First Publication
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons - Only show when not in form mode */}
      {!showPublicationForm && (
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-[#1890FF] text-white rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-lg"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ExtraInformation;
