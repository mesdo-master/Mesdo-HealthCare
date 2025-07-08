import { useState, useCallback, useEffect } from "react";
import { ChevronRight, FileInput, Settings } from "lucide-react";
import axiosInstance from "../.././../../lib/axio"

const UploadResume = ({ onNext ,setFormData}) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files?.[0];
    console.log("📁 Uploaded file:", uploadedFile);

    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE) {
      alert("File size exceeds 50MB limit.");
      return;
    }

    setFile(uploadedFile);

  };


useEffect(() => {
    const handleResumeExtraction = async () => {
      try {
        if (file) {
  
          const formData = new FormData();
          formData.append("resume", file); // 'resume' must match the multer field name
  
          await axiosInstance.post(
            "/onboarding/saveResume",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

        }
      } catch (error) {
        console.error("❌ Upload failed", error);
      }
    };
  
    handleResumeExtraction();
  }, [file]);

  
  // useEffect(() => {
  //   const handleResumeExtraction = async () => {
  //     try {
  //       if (file) {
  //         console.log("i am in handle resume extractor");
  
  //         const formData = new FormData();
  //         formData.append("resume", file); // 'resume' must match the multer field name
  
  //         const response = await axiosInstance.post(
  //           "/onboarding/resume-extraction",
  //           formData,
  //           {
  //             headers: {
  //               "Content-Type": "multipart/form-data",
  //             },
  //           }
  //         );

  //         const structuredResumeData = response.data

  //         setFormData(prev => ({
  //           ...prev,
  //           name: structuredResumeData.name || "",
  //           email: structuredResumeData.email || "",
  //           phoneNo: structuredResumeData.phoneNo || "",
  //           gender: structuredResumeData.gender || "",
  //           dob: structuredResumeData.dob || "",
  //           state: structuredResumeData.state || "",
  //           city: structuredResumeData.city || "",
  //           tagline: structuredResumeData.tagline || "",
  //           aboutYou: structuredResumeData.aboutYou || "",
  //           qualifications: structuredResumeData.qualifications || [],
  //           workExperience: structuredResumeData.workexperience || [],
  //           Skills: structuredResumeData.Skills || [],
  //           Achievements: structuredResumeData.achievements || [],
  //           interest: structuredResumeData.interests || [],
  //         }));
  
  //         console.log("✅ File uploaded successfully", response.data);
  //       }
  //     } catch (error) {
  //       console.error("❌ Upload failed", error);
  //     }
  //   };
  
  //   handleResumeExtraction();
  // }, [file]);
  

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const uploadedFile = e.dataTransfer.files?.[0];
    console.log("📥 Dropped file:", uploadedFile);

    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE) {
      alert("File size exceeds 50MB limit.");
      return;
    }

    setFile(uploadedFile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-[653px] text-center">
        <h2 className="text-[28px] font-semibold text-gray-900 mb-2">
          Upload Resume
        </h2>
        <p className="text-base text-[#8C8C8C]">
          Include all of your relevant experience and dates in this section.
        </p>

        <label
          htmlFor="resumeUpload"
          className={`mt-8 w-full h-[378px] bg-[#F7F7F7] border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging
              ? "border-[#1890FF] bg-blue-50"
              : "border-[#D9D9D9] hover:border-[#1890FF]"
            }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          aria-label="Resume upload area"
        >
          <div className="flex flex-col items-center">
            <FileInput size={50} className="text-[#000000] mb-4 opacity-70" />

            {file ? (
              <>
                <p className="text-base text-gray-700">{file.name}</p>
                <button
                  onClick={() => setFile(null)}
                  className="mt-2 text-sm text-red-500 border px-3 py-1 rounded-lg hover:bg-red-600 hover:text-white border-red-600"
                >
                  Remove File
                </button>
              </>
            ) : (
              <>
                <p className="text-base text-gray-900">
                  <span className="underline font-medium">Click to upload</span>
                  <span className="text-[#646262] font-sm">
                    {" "}
                    or Drag and drop
                  </span>
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "rgba(0, 0, 0, 0.4)" }}
                >
                  Maximum file size 50MB
                </p>
              </>
            )}
          </div>
        </label>

        <input
          id="resumeUpload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx"
        />

        <button
          onClick={onNext}
          disabled={!file}
          className={`mt-6 w-40 h-[44px] text-white font-medium rounded-lg transition-colors ${file
              ? "bg-[#1890FF] hover:bg-blue-500"
              : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          Next
        </button>
      </div>

      {/* Setup Manually Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#595959] bg-white border border-[#D9D9D9] rounded-lg hover:text-[#1890FF] hover:border-[#1890FF] transition-colors group"
        >
          <Settings
            size={16}
            className="text-[#8C8C8C] group-hover:text-[#1890FF]"
          />
          <span>Setup Manually</span>
          <ChevronRight
            size={16}
            className="text-[#8C8C8C] group-hover:text-[#1890FF]"
          />
        </button>
      </div>
    </div>
  );
};

export default UploadResume;
