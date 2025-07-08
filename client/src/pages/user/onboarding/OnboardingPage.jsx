import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Add this import
import axiosInstance from "../../../lib/axio";
import UploadResume from "./components/UploadResume";
import PersonalInfo from "./components/PersonalInfo";
import ProfessionalSummary from "./components/ProfessionalSummary";
import Qualification from "./components/Qualification";
import WorkExperience from "./components/WorkExperience";
import SkillsSpecialization from "./components/SkillsSpecialization";
import Achievement from "./components/Achievement";
import Interest from "./components/Interest";
import {
  checkAuth,
  updateFormDataFunc,
} from "../../../store/features/authSlice";

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    gender: "",
    dob: "",
    state: "",
    city: "",
    tagline: "",
    aboutYou: "",
    qualifications: [],
    workExperience: [],
    Skills: [],
    Achievements: [],
    interest: [],
    onboardingCompleted: false,
  });
  const [forceQualificationPreview, setForceQualificationPreview] =
    useState(false);
  const [forceWorkExperiencePreview, setForceWorkExperiencePreview] =
    useState(false);
  const [forceAchievementPreview, setForceAchievementPreview] = useState(false);

  useEffect(() => {
    const fetchPredata = async () => {
      try {
        const response = await axiosInstance.get("/onboarding/predata");
        setOnboardingCompleted(true);
        setFormData((prev) => ({ ...prev, email: response.data.user.email }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchPredata();
  }, []);

  const updateFormData = (data) => {
    console.log("Updating form data:", data);
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    // If moving from Professional Summary to Qualification
    if (
      step === 3 &&
      formData.qualifications &&
      formData.qualifications.length > 0
    ) {
      setForceQualificationPreview(true);
    } else {
      setForceQualificationPreview(false);
    }
    // If moving from Qualification to Work Experience
    if (
      step === 4 &&
      formData.workExperience &&
      formData.workExperience.length > 0
    ) {
      setForceWorkExperiencePreview(true);
    } else {
      setForceWorkExperiencePreview(false);
    }
    // If moving from SkillsSpecialization to Achievement
    if (
      step === 6 &&
      formData.achievements &&
      formData.achievements.length > 0
    ) {
      setForceAchievementPreview(true);
    } else {
      setForceAchievementPreview(false);
    }
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    console.log("Moving to step:", step - 1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    setIsLoading(true);
    console.log("Finishing onboarding with data:", formData);
    try {
      const response = await axiosInstance.post(
        "/onboarding/complete-onboarding",
        formData
      );
      console.log("Data saved successfully:", response.data);

      // Update local formData
      const updatedFormData = { ...formData, onboardingCompleted: true };
      setFormData(updatedFormData);

      // Dispatch to Redux store
      dispatch(updateFormDataFunc(updatedFormData));
      dispatch(checkAuth());
      // Redirect to home page
      navigate(`/profile/${currentUser?.username}`);
    } catch (error) {
      console.error("Error saving data:", error.response?.data || error);
      // Handle error (e.g., show error message)
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToQualificationPreview = () => {
    setStep(4);
    setForceQualificationPreview(true);
  };

  const onBackToWorkExperiencePreview = () => {
    setStep(5);
    setForceWorkExperiencePreview(true);
  };

  const onBackToAchievementPreview = () => {
    setStep(7);
    setForceAchievementPreview(true);
  };

  const steps = [
    { component: UploadResume, title: "Upload Resume" },
    { component: PersonalInfo, title: "Personal Information" },
    { component: ProfessionalSummary, title: "Professional Summary" },
    { component: Qualification, title: "Qualification" },
    { component: WorkExperience, title: "Work Experience" },
    { component: SkillsSpecialization, title: "Skills & Specialization" },
    { component: Achievement, title: "Achievement" },
    { component: Interest, title: "Interest" },
  ];

  const CurrentStep = steps[step - 1].component;

  return (
    <div>
      {step === 4 ? (
        <Qualification
          formData={formData}
          setFormData={setFormData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLastStep={step === steps.length}
          onFinish={handleFinish}
          isLoading={isLoading}
          forcePreview={forceQualificationPreview}
        />
      ) : step === 5 ? (
        <WorkExperience
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLastStep={step === steps.length}
          onFinish={handleFinish}
          isLoading={isLoading}
          forcePreview={forceWorkExperiencePreview}
          onBackToQualificationPreview={onBackToQualificationPreview}
        />
      ) : step === 6 ? (
        <SkillsSpecialization
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onPrevious={() => {
            setStep(5);
            setForceWorkExperiencePreview(true);
          }}
        />
      ) : step === 7 ? (
        <Achievement
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onPrevious={() => setStep(6)}
          forcePreview={forceAchievementPreview}
        />
      ) : step === 8 ? (
        <Interest
          formData={formData}
          updateFormData={updateFormData}
          onFinish={handleFinish}
          onPrevious={() => {
            setStep(7);
            setForceAchievementPreview(true);
          }}
          isLoading={isLoading}
        />
      ) : (
        <CurrentStep
          formData={formData}
          setFormData={setFormData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLastStep={step === steps.length}
          onFinish={handleFinish}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Onboarding;
