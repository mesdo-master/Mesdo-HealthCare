import { useState, useEffect } from "react";
import { ArrowLeft, Edit2, Trash2, Plus, Check } from "lucide-react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import PropTypes from "prop-types";
import StepProgressCircle from "../../../../components/StepProgressCircle";
import axios from "axios";

const WorkExperience = ({ formData, updateFormData, onNext, onPrevious }) => {
  const [formValues, setFormValues] = useState({
    jobTitle: "",
    hospital: "",
    employmentType: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    skills: [],
    description: "",
  });
  const [expList, setExpList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  // New state for API data
  const [hospitals, setHospitals] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    hospitals: false,
    cities: false,
  });

  // Initialize work experience with existing data when component mounts
  useEffect(() => {
    if (
      formData &&
      formData.workExperience &&
      formData.workExperience.length > 0
    ) {
      setExpList(formData.workExperience);
      setShowPreview(true);
    }
  }, [formData]);

  // ReactQuill Modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const employmentTypeOptions = [
    { value: "", label: "Select" },
    { value: "fullTime", label: "Full-Time" },
    { value: "partTime", label: "Part-Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "volunteer", label: "Volunteer" },
  ];

  // Fetch Hospitals and Clinics from API
  const fetchHospitals = async () => {
    setLoading((prev) => ({ ...prev, hospitals: true }));
    try {
      let allHospitals = [];

      // Try Indian Hospitals API first
      try {
        const response = await axios.get(
          "https://indian-hospital.herokuapp.com/api/v1/hospitals/?limit=500"
        );
        if (response.data && Array.isArray(response.data)) {
          const hospitalOptions = response.data.map((hospital) => ({
            value: hospital.name,
            label: `${hospital.name} - ${hospital.city}, ${hospital.state}`,
            city: hospital.city,
            state: hospital.state,
            category: hospital.category,
          }));
          allHospitals = [...hospitalOptions];
        }
      } catch (error) {
        console.warn("Indian Hospitals API failed:", error);
      }

      // Fallback data for major hospitals if API fails
      const fallbackHospitals = [
        // Delhi
        {
          value: "All India Institute of Medical Sciences (AIIMS)",
          label: "All India Institute of Medical Sciences (AIIMS) - Delhi",
          city: "Delhi",
          state: "Delhi",
          category: "Public",
        },
        {
          value: "Fortis Hospital",
          label: "Fortis Hospital - Delhi",
          city: "Delhi",
          state: "Delhi",
          category: "Private",
        },
        {
          value: "Apollo Hospital",
          label: "Apollo Hospital - Delhi",
          city: "Delhi",
          state: "Delhi",
          category: "Private",
        },
        {
          value: "Max Super Speciality Hospital",
          label: "Max Super Speciality Hospital - Delhi",
          city: "Delhi",
          state: "Delhi",
          category: "Private",
        },
        {
          value: "Medanta - The Medicity",
          label: "Medanta - The Medicity - Gurgaon",
          city: "Gurgaon",
          state: "Haryana",
          category: "Private",
        },

        // Mumbai
        {
          value: "Tata Memorial Hospital",
          label: "Tata Memorial Hospital - Mumbai",
          city: "Mumbai",
          state: "Maharashtra",
          category: "Public",
        },
        {
          value: "Kokilaben Dhirubhai Ambani Hospital",
          label: "Kokilaben Dhirubhai Ambani Hospital - Mumbai",
          city: "Mumbai",
          state: "Maharashtra",
          category: "Private",
        },
        {
          value: "Lilavati Hospital",
          label: "Lilavati Hospital - Mumbai",
          city: "Mumbai",
          state: "Maharashtra",
          category: "Private",
        },
        {
          value: "Breach Candy Hospital",
          label: "Breach Candy Hospital - Mumbai",
          city: "Mumbai",
          state: "Maharashtra",
          category: "Private",
        },

        // Bangalore
        {
          value: "Manipal Hospital",
          label: "Manipal Hospital - Bangalore",
          city: "Bangalore",
          state: "Karnataka",
          category: "Private",
        },
        {
          value: "Narayana Health",
          label: "Narayana Health - Bangalore",
          city: "Bangalore",
          state: "Karnataka",
          category: "Private",
        },
        {
          value: "St. John's Medical College Hospital",
          label: "St. John's Medical College Hospital - Bangalore",
          city: "Bangalore",
          state: "Karnataka",
          category: "Private",
        },

        // Chennai
        {
          value: "Apollo Hospital Chennai",
          label: "Apollo Hospital Chennai - Chennai",
          city: "Chennai",
          state: "Tamil Nadu",
          category: "Private",
        },
        {
          value: "Fortis Malar Hospital",
          label: "Fortis Malar Hospital - Chennai",
          city: "Chennai",
          state: "Tamil Nadu",
          category: "Private",
        },
        {
          value: "MIOT International",
          label: "MIOT International - Chennai",
          city: "Chennai",
          state: "Tamil Nadu",
          category: "Private",
        },

        // Hyderabad
        {
          value: "Apollo Hospital Hyderabad",
          label: "Apollo Hospital Hyderabad - Hyderabad",
          city: "Hyderabad",
          state: "Telangana",
          category: "Private",
        },
        {
          value: "Yashoda Hospitals",
          label: "Yashoda Hospitals - Hyderabad",
          city: "Hyderabad",
          state: "Telangana",
          category: "Private",
        },
        {
          value: "Continental Hospitals",
          label: "Continental Hospitals - Hyderabad",
          city: "Hyderabad",
          state: "Telangana",
          category: "Private",
        },

        // Kolkata
        {
          value: "AMRI Hospital",
          label: "AMRI Hospital - Kolkata",
          city: "Kolkata",
          state: "West Bengal",
          category: "Private",
        },
        {
          value: "Apollo Gleneagles Hospital",
          label: "Apollo Gleneagles Hospital - Kolkata",
          city: "Kolkata",
          state: "West Bengal",
          category: "Private",
        },
        {
          value: "Fortis Hospital Kolkata",
          label: "Fortis Hospital Kolkata - Kolkata",
          city: "Kolkata",
          state: "West Bengal",
          category: "Private",
        },

        // Pune
        {
          value: "Ruby Hall Clinic",
          label: "Ruby Hall Clinic - Pune",
          city: "Pune",
          state: "Maharashtra",
          category: "Private",
        },
        {
          value: "Jehangir Hospital",
          label: "Jehangir Hospital - Pune",
          city: "Pune",
          state: "Maharashtra",
          category: "Private",
        },
        {
          value: "Deenanath Mangeshkar Hospital",
          label: "Deenanath Mangeshkar Hospital - Pune",
          city: "Pune",
          state: "Maharashtra",
          category: "Private",
        },

        // Ahmedabad
        {
          value: "Sterling Hospital",
          label: "Sterling Hospital - Ahmedabad",
          city: "Ahmedabad",
          state: "Gujarat",
          category: "Private",
        },
        {
          value: "Apollo Hospital Ahmedabad",
          label: "Apollo Hospital Ahmedabad - Ahmedabad",
          city: "Ahmedabad",
          state: "Gujarat",
          category: "Private",
        },

        // Jaipur
        {
          value: "Fortis Escorts Hospital",
          label: "Fortis Escorts Hospital - Jaipur",
          city: "Jaipur",
          state: "Rajasthan",
          category: "Private",
        },
        {
          value: "Narayana Multispeciality Hospital",
          label: "Narayana Multispeciality Hospital - Jaipur",
          city: "Jaipur",
          state: "Rajasthan",
          category: "Private",
        },

        // Lucknow
        {
          value: "King George's Medical University",
          label: "King George's Medical University - Lucknow",
          city: "Lucknow",
          state: "Uttar Pradesh",
          category: "Public",
        },
        {
          value: "Sahara Hospital",
          label: "Sahara Hospital - Lucknow",
          city: "Lucknow",
          state: "Uttar Pradesh",
          category: "Private",
        },

        // Clinics
        {
          value: "Primary Health Centre",
          label: "Primary Health Centre - Various Locations",
          city: "Various",
          state: "Various",
          category: "Public",
        },
        {
          value: "Community Health Centre",
          label: "Community Health Centre - Various Locations",
          city: "Various",
          state: "Various",
          category: "Public",
        },
        {
          value: "Dental Clinic",
          label: "Dental Clinic - Various Locations",
          city: "Various",
          state: "Various",
          category: "Private",
        },
        {
          value: "Eye Care Centre",
          label: "Eye Care Centre - Various Locations",
          city: "Various",
          state: "Various",
          category: "Private",
        },
        {
          value: "Physiotherapy Clinic",
          label: "Physiotherapy Clinic - Various Locations",
          city: "Various",
          state: "Various",
          category: "Private",
        },
        {
          value: "Diagnostic Centre",
          label: "Diagnostic Centre - Various Locations",
          city: "Various",
          state: "Various",
          category: "Private",
        },
      ];

      // Use fetched data if available, otherwise use fallback
      const finalHospitals =
        allHospitals.length > 0 ? allHospitals : fallbackHospitals;

      // Sort hospitals alphabetically
      const sortedHospitals = finalHospitals.sort((a, b) =>
        a.label.localeCompare(b.label)
      );

      // Add "Other" option at the end
      sortedHospitals.push({
        value: "other",
        label: "Other (Please specify)",
        city: "Other",
        state: "Other",
        category: "Other",
      });

      setHospitals(sortedHospitals);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      // Fallback to basic options if everything fails
      setHospitals([
        {
          value: "other",
          label: "Other (Please specify)",
          city: "Other",
          state: "Other",
          category: "Other",
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, hospitals: false }));
    }
  };

  // Fetch Indian Cities from API
  const fetchCities = async () => {
    setLoading((prev) => ({ ...prev, cities: true }));
    try {
      let allCities = [];

      // Try Indian Cities API first
      try {
        const response = await axios.get(
          "https://indian-cities-api-nocbegfhqg.now.sh/cities"
        );
        if (response.data && Array.isArray(response.data)) {
          const cityOptions = response.data.map((city) => ({
            value: city.name,
            label: `${city.name}, ${city.state}`,
            state: city.state,
          }));
          allCities = [...cityOptions];
        }
      } catch (error) {
        console.warn("Indian Cities API failed:", error);
      }

      // Try alternative API
      if (allCities.length === 0) {
        try {
          const response = await axios.get(
            "https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json"
          );
          if (response.data && Array.isArray(response.data)) {
            const cityOptions = response.data.map((city) => ({
              value: city.name,
              label: `${city.name}, ${city.state}`,
              state: city.state,
            }));
            allCities = [...cityOptions];
          }
        } catch (error) {
          console.warn("GitHub Cities API failed:", error);
        }
      }

      // Comprehensive fallback data for major Indian cities
      const fallbackCities = [
        // Metropolitan Cities
        { value: "Mumbai", label: "Mumbai, Maharashtra", state: "Maharashtra" },
        { value: "Delhi", label: "Delhi, Delhi", state: "Delhi" },
        {
          value: "Bangalore",
          label: "Bangalore, Karnataka",
          state: "Karnataka",
        },
        {
          value: "Hyderabad",
          label: "Hyderabad, Telangana",
          state: "Telangana",
        },
        { value: "Ahmedabad", label: "Ahmedabad, Gujarat", state: "Gujarat" },
        { value: "Chennai", label: "Chennai, Tamil Nadu", state: "Tamil Nadu" },
        {
          value: "Kolkata",
          label: "Kolkata, West Bengal",
          state: "West Bengal",
        },
        { value: "Surat", label: "Surat, Gujarat", state: "Gujarat" },
        { value: "Pune", label: "Pune, Maharashtra", state: "Maharashtra" },
        { value: "Jaipur", label: "Jaipur, Rajasthan", state: "Rajasthan" },

        // Major Cities
        {
          value: "Lucknow",
          label: "Lucknow, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Kanpur",
          label: "Kanpur, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Nagpur", label: "Nagpur, Maharashtra", state: "Maharashtra" },
        {
          value: "Indore",
          label: "Indore, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        { value: "Thane", label: "Thane, Maharashtra", state: "Maharashtra" },
        {
          value: "Bhopal",
          label: "Bhopal, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        {
          value: "Visakhapatnam",
          label: "Visakhapatnam, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        { value: "Patna", label: "Patna, Bihar", state: "Bihar" },
        { value: "Vadodara", label: "Vadodara, Gujarat", state: "Gujarat" },
        {
          value: "Ghaziabad",
          label: "Ghaziabad, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Ludhiana", label: "Ludhiana, Punjab", state: "Punjab" },
        { value: "Agra", label: "Agra, Uttar Pradesh", state: "Uttar Pradesh" },
        { value: "Nashik", label: "Nashik, Maharashtra", state: "Maharashtra" },
        { value: "Faridabad", label: "Faridabad, Haryana", state: "Haryana" },
        {
          value: "Meerut",
          label: "Meerut, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Rajkot", label: "Rajkot, Gujarat", state: "Gujarat" },
        {
          value: "Varanasi",
          label: "Varanasi, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Srinagar",
          label: "Srinagar, Jammu and Kashmir",
          state: "Jammu and Kashmir",
        },
        {
          value: "Aurangabad",
          label: "Aurangabad, Maharashtra",
          state: "Maharashtra",
        },
        { value: "Dhanbad", label: "Dhanbad, Jharkhand", state: "Jharkhand" },
        { value: "Amritsar", label: "Amritsar, Punjab", state: "Punjab" },
        { value: "Ranchi", label: "Ranchi, Jharkhand", state: "Jharkhand" },
        { value: "Howrah", label: "Howrah, West Bengal", state: "West Bengal" },
        {
          value: "Coimbatore",
          label: "Coimbatore, Tamil Nadu",
          state: "Tamil Nadu",
        },
        {
          value: "Jabalpur",
          label: "Jabalpur, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        {
          value: "Gwalior",
          label: "Gwalior, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        {
          value: "Vijayawada",
          label: "Vijayawada, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        { value: "Jodhpur", label: "Jodhpur, Rajasthan", state: "Rajasthan" },
        { value: "Madurai", label: "Madurai, Tamil Nadu", state: "Tamil Nadu" },
        {
          value: "Raipur",
          label: "Raipur, Chhattisgarh",
          state: "Chhattisgarh",
        },
        { value: "Kota", label: "Kota, Rajasthan", state: "Rajasthan" },
        { value: "Guwahati", label: "Guwahati, Assam", state: "Assam" },
        {
          value: "Chandigarh",
          label: "Chandigarh, Chandigarh",
          state: "Chandigarh",
        },
        {
          value: "Solapur",
          label: "Solapur, Maharashtra",
          state: "Maharashtra",
        },
        {
          value: "Bareilly",
          label: "Bareilly, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Moradabad",
          label: "Moradabad, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Mysore", label: "Mysore, Karnataka", state: "Karnataka" },
        { value: "Gurgaon", label: "Gurgaon, Haryana", state: "Haryana" },
        {
          value: "Aligarh",
          label: "Aligarh, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Jalandhar", label: "Jalandhar, Punjab", state: "Punjab" },
        {
          value: "Tiruchirappalli",
          label: "Tiruchirappalli, Tamil Nadu",
          state: "Tamil Nadu",
        },
        { value: "Bhubaneswar", label: "Bhubaneswar, Odisha", state: "Odisha" },
        { value: "Salem", label: "Salem, Tamil Nadu", state: "Tamil Nadu" },
        { value: "Warangal", label: "Warangal, Telangana", state: "Telangana" },
        {
          value: "Thiruvananthapuram",
          label: "Thiruvananthapuram, Kerala",
          state: "Kerala",
        },
        {
          value: "Guntur",
          label: "Guntur, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        {
          value: "Bhiwandi",
          label: "Bhiwandi, Maharashtra",
          state: "Maharashtra",
        },
        {
          value: "Saharanpur",
          label: "Saharanpur, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Gorakhpur",
          label: "Gorakhpur, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Bikaner", label: "Bikaner, Rajasthan", state: "Rajasthan" },
        {
          value: "Amravati",
          label: "Amravati, Maharashtra",
          state: "Maharashtra",
        },
        {
          value: "Noida",
          label: "Noida, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Jamshedpur",
          label: "Jamshedpur, Jharkhand",
          state: "Jharkhand",
        },
        {
          value: "Bhilai",
          label: "Bhilai, Chhattisgarh",
          state: "Chhattisgarh",
        },
        { value: "Cuttack", label: "Cuttack, Odisha", state: "Odisha" },
        {
          value: "Firozabad",
          label: "Firozabad, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Kochi", label: "Kochi, Kerala", state: "Kerala" },
        { value: "Bhavnagar", label: "Bhavnagar, Gujarat", state: "Gujarat" },
        {
          value: "Dehradun",
          label: "Dehradun, Uttarakhand",
          state: "Uttarakhand",
        },
        {
          value: "Durgapur",
          label: "Durgapur, West Bengal",
          state: "West Bengal",
        },
        {
          value: "Asansol",
          label: "Asansol, West Bengal",
          state: "West Bengal",
        },
        { value: "Nanded", label: "Nanded, Maharashtra", state: "Maharashtra" },
        {
          value: "Kolhapur",
          label: "Kolhapur, Maharashtra",
          state: "Maharashtra",
        },
        { value: "Ajmer", label: "Ajmer, Rajasthan", state: "Rajasthan" },
        { value: "Gulbarga", label: "Gulbarga, Karnataka", state: "Karnataka" },
        { value: "Jamnagar", label: "Jamnagar, Gujarat", state: "Gujarat" },
        {
          value: "Ujjain",
          label: "Ujjain, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        {
          value: "Siliguri",
          label: "Siliguri, West Bengal",
          state: "West Bengal",
        },
        {
          value: "Jhansi",
          label: "Jhansi, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Nellore",
          label: "Nellore, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        {
          value: "Jammu",
          label: "Jammu, Jammu and Kashmir",
          state: "Jammu and Kashmir",
        },
        { value: "Belgaum", label: "Belgaum, Karnataka", state: "Karnataka" },
        {
          value: "Mangalore",
          label: "Mangalore, Karnataka",
          state: "Karnataka",
        },
        {
          value: "Tirunelveli",
          label: "Tirunelveli, Tamil Nadu",
          state: "Tamil Nadu",
        },
        {
          value: "Malegaon",
          label: "Malegaon, Maharashtra",
          state: "Maharashtra",
        },
        { value: "Gaya", label: "Gaya, Bihar", state: "Bihar" },
        { value: "Udaipur", label: "Udaipur, Rajasthan", state: "Rajasthan" },
        { value: "Tirupur", label: "Tirupur, Tamil Nadu", state: "Tamil Nadu" },
        {
          value: "Davanagere",
          label: "Davanagere, Karnataka",
          state: "Karnataka",
        },
        { value: "Kozhikode", label: "Kozhikode, Kerala", state: "Kerala" },
        { value: "Akola", label: "Akola, Maharashtra", state: "Maharashtra" },
        {
          value: "Kurnool",
          label: "Kurnool, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        { value: "Bokaro", label: "Bokaro, Jharkhand", state: "Jharkhand" },
        { value: "Bellary", label: "Bellary, Karnataka", state: "Karnataka" },
        { value: "Patiala", label: "Patiala, Punjab", state: "Punjab" },
        { value: "Agartala", label: "Agartala, Tripura", state: "Tripura" },
        { value: "Bhagalpur", label: "Bhagalpur, Bihar", state: "Bihar" },
        {
          value: "Muzaffarnagar",
          label: "Muzaffarnagar, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Latur", label: "Latur, Maharashtra", state: "Maharashtra" },
        { value: "Dhule", label: "Dhule, Maharashtra", state: "Maharashtra" },
        { value: "Rohtak", label: "Rohtak, Haryana", state: "Haryana" },
        { value: "Korba", label: "Korba, Chhattisgarh", state: "Chhattisgarh" },
        { value: "Bhilwara", label: "Bhilwara, Rajasthan", state: "Rajasthan" },
        { value: "Brahmapur", label: "Brahmapur, Odisha", state: "Odisha" },
        { value: "Muzaffarpur", label: "Muzaffarpur, Bihar", state: "Bihar" },
        {
          value: "Ahmednagar",
          label: "Ahmednagar, Maharashtra",
          state: "Maharashtra",
        },
        {
          value: "Mathura",
          label: "Mathura, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Kollam", label: "Kollam, Kerala", state: "Kerala" },
        {
          value: "Rajahmundry",
          label: "Rajahmundry, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        {
          value: "Kadapa",
          label: "Kadapa, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        {
          value: "Bilaspur",
          label: "Bilaspur, Chhattisgarh",
          state: "Chhattisgarh",
        },
        {
          value: "Shahjahanpur",
          label: "Shahjahanpur, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Bijapur", label: "Bijapur, Karnataka", state: "Karnataka" },
        {
          value: "Rampur",
          label: "Rampur, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Shimoga", label: "Shimoga, Karnataka", state: "Karnataka" },
        {
          value: "Chandrapur",
          label: "Chandrapur, Maharashtra",
          state: "Maharashtra",
        },
        { value: "Junagadh", label: "Junagadh, Gujarat", state: "Gujarat" },
        { value: "Thrissur", label: "Thrissur, Kerala", state: "Kerala" },
        { value: "Alwar", label: "Alwar, Rajasthan", state: "Rajasthan" },
        {
          value: "Bardhaman",
          label: "Bardhaman, West Bengal",
          state: "West Bengal",
        },
        { value: "Kulti", label: "Kulti, West Bengal", state: "West Bengal" },
        {
          value: "Kakinada",
          label: "Kakinada, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        {
          value: "Nizamabad",
          label: "Nizamabad, Telangana",
          state: "Telangana",
        },
        {
          value: "Parbhani",
          label: "Parbhani, Maharashtra",
          state: "Maharashtra",
        },
        { value: "Tumkur", label: "Tumkur, Karnataka", state: "Karnataka" },
        { value: "Hisar", label: "Hisar, Haryana", state: "Haryana" },
        { value: "Panipat", label: "Panipat, Haryana", state: "Haryana" },
        { value: "Darbhanga", label: "Darbhanga, Bihar", state: "Bihar" },
        { value: "Aizawl", label: "Aizawl, Mizoram", state: "Mizoram" },
        {
          value: "Dewas",
          label: "Dewas, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        {
          value: "Ichalkaranji",
          label: "Ichalkaranji, Maharashtra",
          state: "Maharashtra",
        },
        {
          value: "Tirupati",
          label: "Tirupati, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        { value: "Karnal", label: "Karnal, Haryana", state: "Haryana" },
        { value: "Bathinda", label: "Bathinda, Punjab", state: "Punjab" },
        { value: "Jalna", label: "Jalna, Maharashtra", state: "Maharashtra" },
        { value: "Purnia", label: "Purnia, Bihar", state: "Bihar" },
        {
          value: "Satna",
          label: "Satna, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        { value: "Sonipat", label: "Sonipat, Haryana", state: "Haryana" },
        {
          value: "Farrukhabad",
          label: "Farrukhabad, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Sagar",
          label: "Sagar, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        { value: "Rourkela", label: "Rourkela, Odisha", state: "Odisha" },
        { value: "Durg", label: "Durg, Chhattisgarh", state: "Chhattisgarh" },
        { value: "Imphal", label: "Imphal, Manipur", state: "Manipur" },
        {
          value: "Ratlam",
          label: "Ratlam, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        {
          value: "Hapur",
          label: "Hapur, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Anantapur",
          label: "Anantapur, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        { value: "Arrah", label: "Arrah, Bihar", state: "Bihar" },
        {
          value: "Karimnagar",
          label: "Karimnagar, Telangana",
          state: "Telangana",
        },
        {
          value: "Etawah",
          label: "Etawah, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Bharatpur",
          label: "Bharatpur, Rajasthan",
          state: "Rajasthan",
        },
        { value: "Begusarai", label: "Begusarai, Bihar", state: "Bihar" },
        { value: "Gandhidham", label: "Gandhidham, Gujarat", state: "Gujarat" },
        { value: "Sikar", label: "Sikar, Rajasthan", state: "Rajasthan" },
        {
          value: "Thoothukudi",
          label: "Thoothukudi, Tamil Nadu",
          state: "Tamil Nadu",
        },
        {
          value: "Rewa",
          label: "Rewa, Madhya Pradesh",
          state: "Madhya Pradesh",
        },
        {
          value: "Mirzapur",
          label: "Mirzapur, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        { value: "Raichur", label: "Raichur, Karnataka", state: "Karnataka" },
        { value: "Pali", label: "Pali, Rajasthan", state: "Rajasthan" },
        { value: "Khammam", label: "Khammam, Telangana", state: "Telangana" },
        {
          value: "Vizianagaram",
          label: "Vizianagaram, Andhra Pradesh",
          state: "Andhra Pradesh",
        },
        { value: "Katihar", label: "Katihar, Bihar", state: "Bihar" },
        {
          value: "Haridwar",
          label: "Haridwar, Uttarakhand",
          state: "Uttarakhand",
        },
        {
          value: "Sri Ganganagar",
          label: "Sri Ganganagar, Rajasthan",
          state: "Rajasthan",
        },
        {
          value: "Nagercoil",
          label: "Nagercoil, Tamil Nadu",
          state: "Tamil Nadu",
        },
        {
          value: "Bulandshahr",
          label: "Bulandshahr, Uttar Pradesh",
          state: "Uttar Pradesh",
        },
        {
          value: "Thanjavur",
          label: "Thanjavur, Tamil Nadu",
          state: "Tamil Nadu",
        },
        { value: "Dimapur", label: "Dimapur, Nagaland", state: "Nagaland" },
        { value: "Kohima", label: "Kohima, Nagaland", state: "Nagaland" },
        { value: "Shillong", label: "Shillong, Meghalaya", state: "Meghalaya" },
        { value: "Tura", label: "Tura, Meghalaya", state: "Meghalaya" },
        {
          value: "Itanagar",
          label: "Itanagar, Arunachal Pradesh",
          state: "Arunachal Pradesh",
        },
        { value: "Gangtok", label: "Gangtok, Sikkim", state: "Sikkim" },
        { value: "Abohar", label: "Abohar, Punjab", state: "Punjab" },
        { value: "Malerkotla", label: "Malerkotla, Punjab", state: "Punjab" },
        { value: "Khanna", label: "Khanna, Punjab", state: "Punjab" },
        { value: "Phagwara", label: "Phagwara, Punjab", state: "Punjab" },
        { value: "Muktsar", label: "Muktsar, Punjab", state: "Punjab" },
        { value: "Barnala", label: "Barnala, Punjab", state: "Punjab" },
        { value: "Rajpura", label: "Rajpura, Punjab", state: "Punjab" },
        { value: "Firozpur", label: "Firozpur, Punjab", state: "Punjab" },
        { value: "Kapurthala", label: "Kapurthala, Punjab", state: "Punjab" },
        { value: "Sangrur", label: "Sangrur, Punjab", state: "Punjab" },
        { value: "Fazilka", label: "Fazilka, Punjab", state: "Punjab" },
        { value: "Gurdaspur", label: "Gurdaspur, Punjab", state: "Punjab" },
        { value: "Kharar", label: "Kharar, Punjab", state: "Punjab" },
        { value: "Gobindgarh", label: "Gobindgarh, Punjab", state: "Punjab" },
        { value: "Mansa", label: "Mansa, Punjab", state: "Punjab" },
        { value: "Malout", label: "Malout, Punjab", state: "Punjab" },
        { value: "Nabha", label: "Nabha, Punjab", state: "Punjab" },
        { value: "Tarn Taran", label: "Tarn Taran, Punjab", state: "Punjab" },
        { value: "Jagraon", label: "Jagraon, Punjab", state: "Punjab" },
        { value: "Sunam", label: "Sunam, Punjab", state: "Punjab" },
        { value: "Dhuri", label: "Dhuri, Punjab", state: "Punjab" },
        {
          value: "Firozpur Cantt.",
          label: "Firozpur Cantt., Punjab",
          state: "Punjab",
        },
        {
          value: "Sirhind Fatehgarh Sahib",
          label: "Sirhind Fatehgarh Sahib, Punjab",
          state: "Punjab",
        },
        { value: "Rupnagar", label: "Rupnagar, Punjab", state: "Punjab" },
        {
          value: "Jalandhar Cantt.",
          label: "Jalandhar Cantt., Punjab",
          state: "Punjab",
        },
        { value: "Samana", label: "Samana, Punjab", state: "Punjab" },
        { value: "Nawanshahr", label: "Nawanshahr, Punjab", state: "Punjab" },
        {
          value: "Rampura Phul",
          label: "Rampura Phul, Punjab",
          state: "Punjab",
        },
        { value: "Nangal", label: "Nangal, Punjab", state: "Punjab" },
        { value: "Nakodar", label: "Nakodar, Punjab", state: "Punjab" },
        { value: "Zira", label: "Zira, Punjab", state: "Punjab" },
        { value: "Patti", label: "Patti, Punjab", state: "Punjab" },
        { value: "Raikot", label: "Raikot, Punjab", state: "Punjab" },
        { value: "Longowal", label: "Longowal, Punjab", state: "Punjab" },
        { value: "Urmar Tanda", label: "Urmar Tanda, Punjab", state: "Punjab" },
        { value: "Morinda", label: "Morinda, Punjab", state: "Punjab" },
        { value: "Phillaur", label: "Phillaur, Punjab", state: "Punjab" },
        { value: "Pattran", label: "Pattran, Punjab", state: "Punjab" },
        { value: "Qadian", label: "Qadian, Punjab", state: "Punjab" },
        { value: "Sujanpur", label: "Sujanpur, Punjab", state: "Punjab" },
        { value: "Mukerian", label: "Mukerian, Punjab", state: "Punjab" },
        { value: "Talwara", label: "Talwara, Punjab", state: "Punjab" },
      ];

      // Use fetched data if available, otherwise use fallback
      const finalCities = allCities.length > 0 ? allCities : fallbackCities;

      // Sort cities alphabetically
      const sortedCities = finalCities.sort((a, b) =>
        a.label.localeCompare(b.label)
      );

      // Add "Other" option at the end
      sortedCities.push({
        value: "other",
        label: "Other (Please specify)",
        state: "Other",
      });

      setCities(sortedCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      // Fallback to basic options if everything fails
      setCities([
        { value: "other", label: "Other (Please specify)", state: "Other" },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  useEffect(() => {
    fetchHospitals();
    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValues = {
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    };
    if (name === "currentlyWorking" && checked) {
      newValues.endDate = "";
    }
    setFormValues(newValues);
    updateFormData(newValues);
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    const newValues = {
      ...formValues,
      [fieldName]: selectedOption.value,
    };
    setFormValues(newValues);
    updateFormData(newValues);
  };

  const handleQuillChange = (value) => {
    const newValues = {
      ...formValues,
      description: value,
    };
    setFormValues(newValues);
    updateFormData(newValues);
  };

  const handleSkillInputChange = (e) => setSkillInput(e.target.value);
  const handleSkillInputKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      addSkill();
    }
  };
  const addSkill = () => {
    if (skillInput.trim() && !formValues.skills.includes(skillInput.trim())) {
      const newSkills = [...formValues.skills, skillInput.trim()];
      setFormValues((prev) => ({ ...prev, skills: newSkills }));
      updateFormData({ ...formValues, skills: newSkills });
      setSkillInput("");
    }
  };
  const handleSkillRemove = (idx) => {
    const newSkills = formValues.skills.filter((_, i) => i !== idx);
    setFormValues((prev) => ({ ...prev, skills: newSkills }));
    updateFormData({ ...formValues, skills: newSkills });
  };

  const handleAddOrUpdate = () => {
    if (!formValues.jobTitle || !formValues.hospital || !formValues.startDate) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    let updatedList = [...expList];
    if (editIdx !== null) {
      updatedList[editIdx] = { ...formValues };
    } else {
      updatedList.push({ ...formValues });
    }
    setExpList(updatedList);
    updateFormData({ workExperience: updatedList });
    setShowPreview(true);
    setEditIdx(null);
    setFormValues({
      jobTitle: "",
      hospital: "",
      employmentType: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      skills: [],
      description: "",
    });
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setFormValues({ ...expList[idx] });
    setShowPreview(false);
  };

  const handleDelete = (idx) => {
    const updated = expList.filter((_, i) => i !== idx);
    setExpList(updated);
    updateFormData({ workExperience: updated });
  };

  const handleAddNew = () => {
    setEditIdx(null);
    setFormValues({
      jobTitle: "",
      hospital: "",
      employmentType: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      skills: [],
      description: "",
    });
    setShowPreview(false);
  };

  return (
    <div className="flex h-screen">
      {/* Left (scrollable) */}
      <div
        className="w-1/2 flex flex-col justify-between px-[100px] h-screen overflow-y-auto mt-10"
        style={{ minWidth: 560 }}
      >
        <div>
          <button className="mb-8 mt-2 text-left" onClick={onPrevious}>
            <ArrowLeft size={28} className="text-black" />
          </button>
          <div className="flex items-center justify-between mb-1 mt-[10px] ">
            <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px] mb-1">
              Work Experience
            </h1>
            <StepProgressCircle currentStep={2} totalSteps={5} />
          </div>
          <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
            Include all of your relevant experience and dates in this section.
          </p>
          <div className="flex-1">
            {showPreview ? (
              <>
                {expList.map((exp, idx) => (
                  <div key={idx} className="mb-8 ">
                    <div className="flex items-center justify-between ">
                      <div>
                        <div className="text-[20px] font-semibold text-black leading-tight mb-1">
                          {exp.jobTitle} {exp.hospital && `| ${exp.hospital}`}
                        </div>
                        <div className="text-[15px] text-[#8C8C8C] mb-1">
                          {exp.location}{" "}
                          {exp.employmentType && `| ${exp.employmentType}`}
                        </div>
                        <div className="text-[13px] text-[#8C8C8C] mb-2">
                          {exp.startDate && exp.endDate
                            ? `(${exp.startDate} - ${exp.endDate})`
                            : exp.startDate
                            ? `(Start: ${exp.startDate})`
                            : ""}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-[-70px] ">
                        <button
                          type="button"
                          className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleEdit(idx)}
                        >
                          <Edit2 size={18} className="text-[#8C8C8C]" />
                        </button>
                        <button
                          type="button"
                          className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleDelete(idx)}
                        >
                          <Trash2 size={18} className="text-[#8C8C8C]" />
                        </button>
                      </div>
                    </div>
                    {exp.description && (
                      <ul className="list-disc pl-5 mt-2 text-[15px] text-black">
                        {exp.description
                          .replace(/<(.|\n)*?>/g, "")
                          .split(/\n|•|\r/)
                          .filter((line) => line.trim())
                          .map((line, i) => (
                            <li key={i}>{line.trim()}</li>
                          ))}
                      </ul>
                    )}
                    {exp.skills && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {exp.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 rounded-md border border-[#DCDCDC] text-[13px] bg-[#F5F5F5]"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="flex items-center gap-3 mb-8 mt-2"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#8C8C8C]">
                    <Plus size={28} className="text-[#23272E]" />
                  </span>
                  <span className="text-[15px] font-medium text-[#23272E]">
                    Add Experience
                  </span>
                </button>
              </>
            ) : (
              <form className="space-y-6">
                {/* Job Title & Hospital/Clinic */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Job Title*
                    </label>
                    <input
                      name="jobTitle"
                      value={formValues.jobTitle}
                      onChange={handleChange}
                      type="text"
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter job title"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Hospital/Clinic*
                    </label>
                    <Select
                      name="hospital"
                      options={hospitals}
                      value={hospitals.find(
                        (hospital) => hospital.value === formValues.hospital
                      )}
                      onChange={(option) =>
                        handleSelectChange(option, "hospital")
                      }
                      placeholder={
                        loading.hospitals
                          ? "Loading hospitals..."
                          : "Select hospital/clinic"
                      }
                      isLoading={loading.hospitals}
                      className="text-[13px]"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "48px",
                          height: "48px",
                          borderColor: "#e5e7eb",
                          borderRadius: "0.5rem",
                          "&:hover": {
                            borderColor: "#e5e7eb",
                          },
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: "0 16px",
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0,
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Employment Type & Location */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Employment Type
                    </label>
                    <Select
                      name="employmentType"
                      options={employmentTypeOptions}
                      value={employmentTypeOptions.find(
                        (option) => option.value === formValues.employmentType
                      )}
                      onChange={(option) =>
                        handleSelectChange(option, "employmentType")
                      }
                      placeholder="Select"
                      className="text-[13px]"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "48px",
                          height: "48px",
                          borderColor: "#e5e7eb",
                          borderRadius: "0.5rem",
                          "&:hover": {
                            borderColor: "#e5e7eb",
                          },
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: "0 16px",
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0,
                        }),
                      }}
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Location
                    </label>
                    <Select
                      name="location"
                      options={cities}
                      value={cities.find(
                        (city) => city.value === formValues.location
                      )}
                      onChange={(option) =>
                        handleSelectChange(option, "location")
                      }
                      placeholder={
                        loading.cities ? "Loading cities..." : "Select location"
                      }
                      isLoading={loading.cities}
                      className="text-[13px]"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "48px",
                          height: "48px",
                          borderColor: "#e5e7eb",
                          borderRadius: "0.5rem",
                          "&:hover": {
                            borderColor: "#e5e7eb",
                          },
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: "0 16px",
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0,
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Time Period */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Time Period*
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      value={formValues.startDate}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {!formValues.currentlyWorking && (
                    <div className="w-1/2">
                      <label className="block text-[15px] text-gray-900 mb-1">
                        End Date
                      </label>
                      <input
                        name="endDate"
                        type="date"
                        value={formValues.endDate}
                        onChange={handleChange}
                        className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Currently Working Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="currentlyWorking"
                    checked={formValues.currentlyWorking}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <label className="text-[15px] text-gray-900">Present</label>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-[15px] text-gray-900 mb-1">
                    Skills*
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="skills"
                      value={skillInput}
                      onChange={handleSkillInputChange}
                      onKeyDown={handleSkillInputKeyDown}
                      placeholder="Add skill and press enter"
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 pr-10"
                    />
                    {skillInput.trim() && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                        onClick={addSkill}
                        tabIndex={-1}
                      >
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formValues.skills &&
                      formValues.skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="px-3 h-[44px] py-1.5 rounded-md border border-[#DCDCDC] flex items-center text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(idx)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <span>&times;</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[15px] text-gray-900 mb-1">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formValues.description}
                    onChange={handleQuillChange}
                    modules={modules}
                    className="[&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:h-[200px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700"
                    placeholder="Describe your work experience..."
                  />
                </div>

                {/* Buttons */}
                {error && (
                  <div className="text-red-500 text-sm mb-2">{error}</div>
                )}
              </form>
            )}
          </div>
        </div>
        {/* Bottom Buttons - always at the bottom */}
        <div className="flex justify-between items-center pb-8 pt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[15px] font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            Skip All
          </button>
          {showPreview ? (
            <button
              type="button"
              onClick={onNext}
              className="w-[180px] h-[48px] bg-[#4285F4] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddOrUpdate}
              className="w-[180px] h-[48px] bg-[#4285F4] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
            >
              Next
            </button>
          )}
        </div>
      </div>
      {/* Right (fixed, never scrolls) */}
      <div className="w-1/2 h-screen bg-[#f8f8f8] flex-shrink-0" />
    </div>
  );
};

WorkExperience.propTypes = {
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

WorkExperience.defaultProps = {
  updateFormData: () => {},
};

export default WorkExperience;
