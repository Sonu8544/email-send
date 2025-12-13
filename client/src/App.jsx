import { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    education: "",
    noticePeriod: "",
    email: "",
    linkedinUrl: "",
    currentCTC: "",
    experience: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setStatus({
          type: "error",
          message: "Please upload a PDF file only.",
        });
        e.target.value = "";
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatus({
          type: "error",
          message: "File size must be less than 5MB.",
        });
        e.target.value = "";
        return;
      }
      setResumeFile(file);
      setStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("contactNumber", formData.contactNumber);
      formDataToSend.append("education", formData.education);
      formDataToSend.append("noticePeriod", formData.noticePeriod);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("linkedinUrl", formData.linkedinUrl);
      formDataToSend.append("currentCTC", formData.currentCTC);
      formDataToSend.append("experience", formData.experience);
      
      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
      }

      const response = await fetch("https://15.207.222.228:7777/contact", {
      // const response = await fetch("http://localhost:7777/contact", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: "success",
          message: "Form submitted successfully! We'll get back to you soon.",
        });
        setFormData({
          fullName: "",
          contactNumber: "",
          education: "",
          noticePeriod: "",
          email: "",
          linkedinUrl: "",
          currentCTC: "",
          experience: "",
        });
        setResumeFile(null);
        // Reset file input
        const fileInput = document.getElementById("resume");
        if (fileInput) fileInput.value = "";
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit form. Please try again.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please check if the server is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Join Our Team
          </h1>
          <p className="text-center text-gray-800 mb-8 md:mb-12   ">Share your details below and our talent team will be in touch.</p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition"
                    placeholder="Enter Full Name"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label
                    htmlFor="contactNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition"
                    placeholder="81234 56789"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label
                    htmlFor="resume"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Upload Your Resume (PDF)
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#086b92] hover:file:bg-blue-100"
                  />
                  {resumeFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                {/* Education Level */}
                <div>
                  <label
                    htmlFor="education"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mention Your Highest Level Of Education?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition appearance-none bg-white"
                  >
                    <option value="">Select Option</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Notice Period */}
                <div>
                  <label
                    htmlFor="noticePeriod"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mention Your Notice Period{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="noticePeriod"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition appearance-none bg-white"
                  >
                    <option value="">Select Option</option>
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="More than 90 Days">More than 90 Days</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition"
                    placeholder="Enter Email Address"
                  />
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label
                    htmlFor="linkedinUrl"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    LinkedIn Public URL
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition"
                    placeholder="https://www.linkedin.com/in/username"
                  />
                </div>

                {/* Current CTC */}
                <div>
                  <label
                    htmlFor="currentCTC"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mention Your Current CTC?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="currentCTC"
                    name="currentCTC"
                    value={formData.currentCTC}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition"
                    placeholder="Enter Current CTC"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mention Your Experience (In Years){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#086b92] focus:border-transparent outline-none transition appearance-none bg-white"
                  >
                    <option value="">Select Option</option>
                    <option value="0-1 Years">0-1 Years</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="2-3 Years">2-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-7 Years">5-7 Years</option>
                    <option value="7-10 Years">7-10 Years</option>
                    <option value="10+ Years">10+ Years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-[200px] mx-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-[#086b92] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#086b92]/80 focus:outline-none focus:ring-2 focus:ring-[#086b92] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>

          {status.message && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                status.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
