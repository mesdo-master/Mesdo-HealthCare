// Utility function to calculate match percentage between a job and a user
export function calculateMatchPercentage(job, user) {
  if (!user || !job) return 0;

  // --- Skills ---
  const jobSkills = Array.isArray(job.skills)
    ? job.skills.map((s) => s.toLowerCase())
    : [];
  const userSkills = Array.isArray(user.skills)
    ? user.skills.map((s) => s.toLowerCase())
    : [];
  let skillScore = 0;
  if (jobSkills.length > 0 && userSkills.length > 0) {
    const matchedSkills = userSkills.filter((s) => jobSkills.includes(s));
    skillScore = matchedSkills.length / jobSkills.length;
  }

  // --- Experience ---
  let userExp = 0;
  if (Array.isArray(user.experience) && user.experience.length > 0) {
    userExp = Math.max(
      ...user.experience.map((exp) => {
        if (exp.startDate && exp.endDate) {
          return (
            (new Date(exp.endDate) - new Date(exp.startDate)) /
            (1000 * 60 * 60 * 24 * 365)
          );
        } else if (exp.startDate && exp.currentlyWorking) {
          return (
            (Date.now() - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365)
          );
        }
        return 0;
      })
    );
  }
  const jobExp = Number(job.experience) || 0;
  let expScore = 0;
  if (jobExp > 0) {
    expScore = Math.min(userExp / jobExp, 1);
  } else {
    expScore = 1; // If job doesn't specify, full score
  }

  // --- Location ---
  let locationScore = 0;
  if (user.location?.city && job.location) {
    locationScore =
      user.location.city.toLowerCase() === job.location.toLowerCase() ? 1 : 0;
  } else {
    locationScore = 0.5; // Partial if missing
  }

  // --- Salary ---
  let salaryScore = 0;
  if (user.expectedSalary && job.salaryRangeFrom && job.salaryRangeTo) {
    salaryScore =
      user.expectedSalary >= job.salaryRangeFrom &&
      user.expectedSalary <= job.salaryRangeTo
        ? 1
        : 0;
  } else {
    salaryScore = 0.5; // Partial if missing
  }

  // --- Weighted sum ---
  const match =
    skillScore * 65 + expScore * 20 + locationScore * 10 + salaryScore * 5;
  return Math.round(match);
}

// Function to get detailed match breakdown for display
export function getMatchBreakdown(job, user) {
  if (!user || !job) return null;

  const jobSkills = Array.isArray(job.skills)
    ? job.skills.map((s) => s.toLowerCase())
    : [];
  const userSkills = Array.isArray(user.skills)
    ? user.skills.map((s) => s.toLowerCase())
    : [];

  const matchedSkills = userSkills.filter((s) => jobSkills.includes(s));
  const unmatchedSkills = jobSkills.filter((s) => !userSkills.includes(s));

  // Calculate user experience
  let userExp = 0;
  if (Array.isArray(user.experience) && user.experience.length > 0) {
    userExp = Math.max(
      ...user.experience.map((exp) => {
        if (exp.startDate && exp.endDate) {
          return (
            (new Date(exp.endDate) - new Date(exp.startDate)) /
            (1000 * 60 * 60 * 24 * 365)
          );
        } else if (exp.startDate && exp.currentlyWorking) {
          return (
            (Date.now() - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365)
          );
        }
        return 0;
      })
    );
  }

  const jobExp = Number(job.experience) || 0;
  const experienceMatched = jobExp === 0 || userExp >= jobExp;

  return {
    skills: {
      matched: matchedSkills,
      unmatched: unmatchedSkills,
      allJobSkills: jobSkills,
      allUserSkills: userSkills,
    },
    experience: {
      required: jobExp,
      userHas: Math.round(userExp * 10) / 10, // Round to 1 decimal
      matched: experienceMatched,
    },
    location: {
      required: job.location,
      userHas: user.location?.city,
      matched:
        user.location?.city?.toLowerCase() === job.location?.toLowerCase(),
    },
    qualification: {
      required: job.qualification,
      userHas: user.education?.[0]?.qualification || "Not specified",
      matched: true, // Simplified for now
    },
  };
}
