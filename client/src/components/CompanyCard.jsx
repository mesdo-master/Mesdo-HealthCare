import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Building } from "lucide-react";

const CompanyCard = ({ company }) => {
  const navigate = useNavigate();

  const handleCompanyClick = () => {
    if (company._id) {
      navigate(`/company/${company._id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCompanyClick}
    >
      <div className="flex items-start space-x-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {company.name || "Company Name"}
              </h3>

              {company.industry && (
                <p className="text-sm text-gray-600 mt-1">{company.industry}</p>
              )}

              {company.description && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {company.description}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                {company.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                )}

                {company.employeeCount && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{company.employeeCount} employees</span>
                  </div>
                )}
              </div>

              {company.tags && company.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {company.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {company.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{company.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Follow/View Button */}
            <div className="flex-shrink-0 ml-4">
              <button
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompanyClick();
                }}
              >
                View Company
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
