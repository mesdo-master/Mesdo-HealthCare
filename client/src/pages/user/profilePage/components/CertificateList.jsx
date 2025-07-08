import { Ellipsis, Plus, Download, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import Certificate from "../../../../assets/Certificate.png";

// Simple certificate SVG icon
const CertificateIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#E6F0FF" />
    <path d="M7 7h10v10H7V7zm2 2v6h6V9H9z" fill="#1890FF" />
    <circle cx="12" cy="15" r="1" fill="#FFD600" />
  </svg>
);

function formatFileSize(size) {
  if (!size) return "1.5 MB"; // fallback for demo
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const CertificateList = ({ certificates, onSave }) => {
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [localCertificates, setLocalCertificates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ file: null, name: "" });

  useEffect(() => {
    setLocalCertificates(certificates);
  }, [certificates]);

  // Dropdown logic
  const toggleDropdown = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  // Download logic
  const handleDownload = (certId) => {
    // Implement actual download logic here
    setDropdownIndex(null);
    alert("Download triggered");
  };

  // Delete logic
  const handleDelete = (certId) => {
    setLocalCertificates(
      localCertificates.filter((cert) => cert.id !== certId)
    );
    setDropdownIndex(null);
    onSave(localCertificates.filter((cert) => cert.id !== certId));
  };

  // Add certificate logic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ file, name: file.name });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.file || !formData.name) {
      alert("Please select a file");
      return;
    }
    const newCert = {
      id: Date.now(),
      name: formData.name,
      size: formData.file.size,
      file: formData.file,
    };
    const updated = [...localCertificates, newCert];
    setLocalCertificates(updated);
    setShowForm(false);
    setFormData({ file: null, name: "" });
    onSave(updated);
  };

  return (
    <div className="w-full p-4">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localCertificates.map((cert, index) => (
          <div
            key={cert.id}
            className="relative flex items-center bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-400 transition group"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={Certificate}
                alt="Certificate"
                className="w-10 h-10 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate text-[14px]">
                  {cert.name}
                </div>
                <div className="text-[12px] text-gray-500 mt-1">
                  {formatFileSize(cert.size)}
                </div>
              </div>
            </div>
            {/* Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => toggleDropdown(index)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              >
                <Ellipsis className="w-4 h-4" />
              </button>
              {dropdownIndex === index && (
                <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg w-56 z-10 py-2">
                  <button
                    onClick={() => handleDownload(cert.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <Download className="w-4 h-4" /> Download Document
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Document
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Add Certificate Card */}
        <div
          className="flex items-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition bg-white"
          onClick={() => setShowForm(true)}
        >
          <div className="flex items-center justify-center w-8 h-8 border-2 border-blue-500 rounded-full mr-4 flex-shrink-0">
            <Plus className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[14px] font-medium text-gray-900 leading-tight">
              Add Certifications
            </span>
            <span className="text-[12px] text-gray-500 mt-1">
              Browse file or drop here. Only pdf
            </span>
          </div>
        </div>
      </div>
      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:bg-gray-100 rounded-full"
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add Certificate</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
              {formData.file && (
                <div className="text-sm text-gray-700 mt-2">
                  {formData.file.name}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-[40px] rounded-lg px-6 text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[40px] rounded-lg px-6 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateList;
