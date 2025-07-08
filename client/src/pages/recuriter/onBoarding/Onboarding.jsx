import React, { useState } from "react";
import OrganizationInformation from "./components/OrganizationInformation";
import About from "./components/About";
import Location from "./components/Location";
import { useDispatch } from "react-redux";
import {
  completeRecruiterOnboarding,
  organizationLogoUpload,
} from "../../../store/features/authSlice";
import { useNavigate } from "react-router-dom";

const OnboardingRecruiter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Tracks the current step (1, 2, or 3)
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    organizationSize: "",
    organizationType: "",
    orgLogo: "",
    tagline: "",
    phoneNo: "",
    overview: "",
    locationName: "",
    locationAddress: "",
  });

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add this function for OrganizationInformation
  const updateFormData = (updatedFields) => {
    setFormData((prevData) => ({
      ...prevData,
      ...updatedFields,
    }));
  };

  const handleImageUpload = async (e) => {
    const image = e.target.files[0];

    if (!image) {
      alert("Please select an image to upload.");
      return;
    }
    const response = await dispatch(organizationLogoUpload(image));

    setFormData((prevData) => ({
      ...prevData,
      orgLogo: response.payload,
    }));
  };

  // Move to the next step
  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  // Go back to the previous step
  const prevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  // Simulate saving to a database
  const saveToDatabase = async () => {
    console.log("Saving to database:", formData);
    const response = await dispatch(completeRecruiterOnboarding(formData));
    console.log("Response from saveToDatabase:", response);
    navigate("/");
    alert("Organization data saved successfully!");
  };

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OrganizationInformation
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <About
            formData={formData}
            handleChange={handleChange}
            handleImageChange={handleImageUpload}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <Location
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
            saveToDatabase={saveToDatabase}
          />
        );
      default:
        return null;
    }
  };

  return <div>{renderStep()}</div>;
};

export default OnboardingRecruiter;
