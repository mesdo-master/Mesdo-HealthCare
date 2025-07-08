import { useState } from "react";
import { ArrowLeft } from "lucide-react";

function Interest({
  formData,
  updateFormData,
  onFinish,
  onPrevious,
  isLoading,
}) {
  const initialInterests = [
    { id: "1", label: "Cardiology", selected: false },
    { id: "2", label: "Neurology", selected: false },
    { id: "3", label: "Oncology", selected: false },
    { id: "4", label: "Pediatrics", selected: false },
    { id: "5", label: "Nursing", selected: false },
    { id: "6", label: "Surgical Techniques", selected: false },
    { id: "7", label: "Public Health", selected: false },
    { id: "8", label: "Mental Health", selected: false },
    { id: "9", label: "Medical Research", selected: false },
    { id: "10", label: "Healthcare Policy", selected: false },
    { id: "11", label: "Emergency Medicine", selected: false },
    { id: "12", label: "Patient Care", selected: false },
    { id: "13", label: "Radiology", selected: false },
    { id: "14", label: "Pharmacology", selected: false },
    { id: "15", label: "Telemedicine", selected: false },
    { id: "16", label: "Infectious Diseases", selected: false },
    { id: "17", label: "Geriatrics", selected: false },
    { id: "18", label: "Physical Therapy", selected: false },
    { id: "19", label: "Health Informatics", selected: false },
    { id: "20", label: "Clinical Trials", selected: false },
    { id: "21", label: "Dentistry", selected: false },
    { id: "22", label: "Nutrition", selected: false },
    { id: "23", label: "Palliative Care", selected: false },
    { id: "24", label: "Medical Education", selected: false },
    { id: "25", label: "Anesthesiology", selected: false },
    { id: "26", label: "Healthcare Innovation", selected: false },
  ];

  const [interests, setInterests] = useState(() => {
    const savedInterests = formData.Interests || [];
    return initialInterests.map((interest) => ({
      ...interest,
      selected: savedInterests.includes(interest.label),
    }));
  });

  const toggleInterest = (id) => {
    const updatedInterests = interests.map((interest) =>
      interest.id === id
        ? { ...interest, selected: !interest.selected }
        : interest
    );
    setInterests(updatedInterests);

    const selectedInterests = updatedInterests
      .filter((interest) => interest.selected)
      .map((interest) => interest.label);

    updateFormData({ interests: selectedInterests });
  };

  const selectedCount = interests.filter((i) => i.selected).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100" />
      </div>

      <div className="p-6">
        <button
          onClick={onPrevious}
          className="mb-8 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            What are you interested in?
          </h1>
          <p className="text-gray-600 text-sm text-center mb-8">
            Choose 3 or more
          </p>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`
                  px-4 py-2 rounded-full border transition-all
                  ${
                    interest.selected
                      ? "bg-[#1890FF] text-white border-[#1890FF] hover:bg-[#0D6EFD]"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }
                  flex items-center gap-2
                `}
              >
                {interest.label}
                <span className="text-lg leading-none">
                  {interest.selected ? "−" : "+"}
                </span>
              </button>
            ))}
          </div>

          <div className="text-center mb-8">
            <button className="text-blue-600 hover:underline">Show More</button>
          </div>

          <button
            onClick={onFinish}
            className={`
              w-full py-3 rounded-lg transition-all flex items-center justify-center
              ${
                selectedCount >= 3
                  ? isLoading
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
            disabled={selectedCount < 3 || isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Finish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Interest;
