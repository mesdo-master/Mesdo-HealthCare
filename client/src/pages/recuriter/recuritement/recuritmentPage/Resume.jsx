export default function Resume({ applicant }) {
  const resumeUrl = applicant.resume;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-4 md:p-6 rounded-md shadow-sm w-full max-w-4xl">
        {resumeUrl ? (
          <iframe
            src={resumeUrl}
            title="Resume Preview"
            className="w-full h-[80vh] border rounded"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center text-gray-500 space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 7h10M7 11h4m1 8H6a2 2 0 01-2-2V6a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2h-3z"
              />
            </svg>
            <p className="text-lg font-medium">No resume uploaded</p>
            <p className="text-sm text-gray-400">This candidate hasn’t uploaded a resume yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
