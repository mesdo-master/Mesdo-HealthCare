const AddQualification = () => {
  return (
    <div className="space-y-6 my-4">
      {/* Qualification Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="qualification"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Qualification
          </label>
          <select
            id="qualification"
            className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="BSc">BSc</option>
            <option value="MSc">MSc</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="course"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Course
          </label>
          <select
            id="course"
            className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
          </select>
        </div>
      </div>

      {/* Specialization and Passing Year */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="specialization"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Specialization
          </label>
          <select
            id="specialization"
            className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="passingYear"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Passing Year
          </label>
          <input
            type="date"
            id="passingYear"
            className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* University Section */}
      <div>
        <label
          htmlFor="university"
          className="block font-medium text-gray-700 mb-1 text-[15px]"
        >
          University
        </label>
        <select
          id="university"
          className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select</option>
          <option value="IIT">IIT</option>
          <option value="NIT">NIT</option>
          <option value="IIIT">IIIT</option>
        </select>
      </div>

      {/* Skill Section */}
      <div>
        <label
          htmlFor="skill"
          className="block font-medium text-gray-700 mb-1 text-[15px]"
        >
          Skill
        </label>
        <input
          type="text"
          id="skill"
          className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description Section */}
      <div>
        <label
          htmlFor="description"
          className="block font-medium text-gray-700 mb-1 text-[15px]"
        >
          Description
        </label>
        <textarea
          id="description"
          className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default AddQualification;
