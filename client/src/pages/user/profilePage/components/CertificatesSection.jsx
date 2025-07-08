import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import axiosInstance from "../../../../lib/axio";
import Certificate from "../../../../assets/Certificate.png";

const CertificatesSection = ({ isOwnProfile, userData, openModal }) => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    setCertificates(userData?.certifications || []);
  }, [userData?.certifications]);

  // Handle certificate updates
  const handleSaveCertificates = async (updatedCertificates) => {
    // Step 1: Upload all files and replace file with URL
    const uploadedCertificates = await Promise.all(
      updatedCertificates.map(async (cert) => {
        // If already a URL, just use it
        if (typeof cert.file === "string" && cert.file.startsWith("http")) {
          return {
            image: cert.file,
            name: cert.name,
            issuedBy: cert.issuedBy || "",
            year: cert.year || "",
          };
        }
        // If file is a File object, upload it
        if (cert.file instanceof File) {
          const formData = new FormData();
          formData.append("file", cert.file);
          const uploadResponse = await axiosInstance.post(
            "users/upload",
            formData
          );
          const imageUrl = uploadResponse.data.url;
          return {
            image: imageUrl,
            name: cert.name,
            issuedBy: cert.issuedBy || "",
            year: cert.year || "",
          };
        }
        // fallback: if no file, just keep name
        return {
          image: cert.image || "",
          name: cert.name,
          issuedBy: cert.issuedBy || "",
          year: cert.year || "",
        };
      })
    );
    // Step 2: Save to backend
    const response = await axiosInstance.put("/users/updateProfile", {
      certifications: uploadedCertificates,
    });
    setCertificates(uploadedCertificates);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Certifications</h2>
        {isOwnProfile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => openModal("Certifications")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert, index) => (
          <div
            key={cert.id || index}
            className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <img
              src={Certificate}
              alt="Certificate"
              className="w-10 h-10 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-medium text-gray-900 truncate">
                {cert.name}
              </h3>
              {cert.issuedBy && (
                <p className="text-[12px] text-gray-600 mt-1">
                  {cert.issuedBy}
                </p>
              )}
              {cert.year && (
                <p className="text-[12px] text-gray-500">{cert.year}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificatesSection;
