import {
  ChevronRight,
  Link2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

const peopleatApollo = [
  {
    name: "Alena Baptista",
    role: "Dental Surgeon | Apollo Hospitals",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Mira Curtis",
    role: "Dental Surgeon | Apollo Hospitals",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Ashlynn Rosser",
    role: "Dental Surgeon | Apollo Hospitals",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    name: "Alfonso Siphron",
    role: "Dental Surgeon | Apollo Hospitals",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    name: "Jakob Dias",
    role: "Dental Surgeon | Apollo Hospitals",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
];


const TabsSection = () => {
  const { currentJobOrganisationData } = useSelector((state) => state.job);
  return (
    <div className="mt-6">

      <div className="mt-4">
        <div>
          {/* About Section */}
          <div className="bg-white rounded-md shadow-sm p-6 w-175">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {currentJobOrganisationData?.overview}
            </p>
          </div>
          {/* Specialties Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 w-175">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-semibold text-gray-900">
                Specialties
              </h2>
              <button className="text-gray-400 hover:text-gray-600"></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Hospital",
                "Clinic",
                "Health Insurance",
                "Pharmacy",
                "Apollo Lifeline",
                "Hospital",
                "Clinic",
                "Health Insurance",
                "Pharmacy",
                "Apollo Lifeline",
              ].map((specialty) => (
                <span
                  key={specialty}
                  className="px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-[14px]"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* People at Apollo Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 w-175">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-semibold text-gray-900">
                People at Apollo
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                <Link2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-6">
              {peopleatApollo.map((person, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-[14px] font-medium text-gray-900">
                        {person.name}
                      </h3>
                      <p className="text-[14px] text-gray-600">{person.role}</p>
                    </div>
                  </div>
                  <button className="text-[#1890FF] text-[14px] font-medium hover:underline">
                    + Follow
                  </button>
                </div>
              ))}
              <button className="w-full text-center text-[14px] text-[#1890FF] hover:underline flex items-center justify-center">
                Show More <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, isLink = false }) => (
  <div className="flex justify-between items-center">
    <span className="text-[14px] text-gray-600">{label}</span>
    {isLink ? (
      <a
        href={`https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[14px] text-[#1890FF] hover:underline flex items-center"
      >
        {value}
        <ExternalLink className="w-3 h-3 ml-1" />
      </a>
    ) : (
      <span className="text-[14px] text-gray-900">{value}</span>
    )}
  </div>
);

const HospitalDetails = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="space-y-6">
      {/* Profile Section */}

      {/* Tabs and Content */}
      <div className="flex">
        <div className="w-2/3 pr-6">
          <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Right Sidebar */}
      </div>
    </div>
  );
};

export default HospitalDetails;