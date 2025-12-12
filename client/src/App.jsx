import { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    portfolioLink: "",
    education: "",
    noticePeriod: "",
    email: "",
    linkedinUrl: "",
    currentCTC: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("http://localhost:3000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
          portfolioLink: "",
          education: "",
          noticePeriod: "",
          email: "",
          linkedinUrl: "",
          currentCTC: "",
          experience: "",
        });
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
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Application Form
          </h1>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="81234 56789"
                  />
                </div>

                {/* Portfolio/Resume Link */}
                <div>
                  <label
                    htmlFor="portfolioLink"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Add Your Portfolio / Resume Link
                  </label>
                  <input
                    type="url"
                    id="portfolioLink"
                    name="portfolioLink"
                    value={formData.portfolioLink}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="https://www.example.com/portfolio-or-resume"
                  />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
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

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
