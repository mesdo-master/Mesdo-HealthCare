import PropTypes from "prop-types";
import { User, GraduationCap, Briefcase, Sparkle, Star } from "lucide-react";

const stepIcons = [
  <User key="user" size={24} />, // Professional Summary
  <GraduationCap key="grad" size={24} />, // Qualification
  <Briefcase key="brief" size={24} />, // Work Experience
  <Sparkle key="sparkle" size={24} />, // Skills Specialization
  <Star key="star" size={24} />, // Achievement
];

const StepProgressCircle = ({ currentStep, totalSteps = 5 }) => {
  // Calculate arc length for progress
  const arcLength = 125.6 * ((currentStep + 1) / totalSteps); // 2πr, r=20
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#D9D9D9"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#1890FF"
          strokeWidth="3"
          strokeDasharray={`${arcLength} 999`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-black">
        {stepIcons[currentStep]}
      </span>
    </div>
  );
};

StepProgressCircle.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number,
};

export default StepProgressCircle;
