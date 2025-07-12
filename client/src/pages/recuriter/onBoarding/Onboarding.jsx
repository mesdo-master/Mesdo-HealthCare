import React, { useState } from "react";
import OrganizationInformation from "./components/OrganizationInformation";
import About from "./components/About";
import Location from "./components/Location";
import { useDispatch, useSelector } from "react-redux";
import {
  completeRecruiterOnboarding,
  organizationLogoUpload,
} from "../../../store/features/authSlice";
import { useNavigate } from "react-router-dom";

const OnboardingRecruiter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // Tracks the current step (1, 2, or 3)
  const [isLoading, setIsLoading] = useState(false);
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

  // Improved save to database function
  const saveToDatabase = async () => {
    setIsLoading(true);
    console.log("Saving to database:", formData);

    try {
      // Use the Redux async thunk for proper state management
      const resultAction = await dispatch(
        completeRecruiterOnboarding(formData)
      );

      if (completeRecruiterOnboarding.fulfilled.match(resultAction)) {
        console.log("Data saved successfully:", resultAction.payload);

        // Wait a bit for state to update, then navigate
        setTimeout(() => {
          // Navigate based on available username or fallback to home
          const username = currentUser?.username;

          if (username) {
            navigate(`/recuriter/dashboard`);
          } else {
            // Fallback to home if username is not available
            navigate("/");
          }
        }, 500);
      } else {
        // Handle error case
        console.error("Error saving data:", resultAction.payload);
        alert("Error saving organization data. Please try again.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving organization data. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return <div>{renderStep()}</div>;
};

export default OnboardingRecruiter;
