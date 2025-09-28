import React, { useState } from "react";

function ContactUs() {
  const [form, setForm] = useState({
    full_name: "",
    contact_info: "",
    group_name: "",
    message: "",
    reason: "Reporting a bug",
  });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("");
    
    try {
      const response = await fetch("https://formspree.io/f/mwprvzne", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.full_name,
          contact_info: form.contact_info,
          group_name: form.group_name,
          message: form.message,
          reason: form.reason,
          subject: `ChamaVault Contact: ${form.reason}`,
        })
      });

      if (response.ok) {
        setStatus("success");
        setForm({ 
          full_name: "", 
          contact_info: "", 
          group_name: "", 
          message: "", 
          reason: "Reporting a bug" 
        });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions = [
    { value: "Reporting a bug", icon: "🐛" },
    { value: "Suggesting a new feature", icon: "💡" },
    { value: "Rating the app", icon: "⭐" },
    { value: "General inquiry", icon: "❓" },
    { value: "Technical support", icon: "🔧" },
    { value: "Other", icon: "📝" }
  ];

  const getReasonIcon = (reason) => {
    const option = reasonOptions.find(opt => opt.value === reason);
    return option ? option.icon : "📝";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📞</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We'd love to hear from you! Whether you found a bug, have a feature request, 
            or just want to share feedback about ChamaVault.
          </p>
        </div>

        {/* Contact Info Card - Only Email */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-white">📧</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Email Us</h3>
            <p className="text-gray-600 text-lg">support@chamavault.com</p>
            <p className="text-gray-500 text-sm mt-2">We typically respond within 24 hours</p>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Send us a Message
            </h2>
            <p className="text-blue-100">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Name and Contact Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📞📧 Phone Number or Email *
                </label>
                <input
                  type="text"
                  name="contact_info"
                  value={form.contact_info}
                  onChange={handleChange}
                  placeholder="Phone: +254 700 000 000 or Email: your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👥 Group Name *
              </label>
              <input
                type="text"
                name="group_name"
                value={form.group_name}
                onChange={handleChange}
                placeholder="Enter your chama group name"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
              />
            </div>

            {/* Reason Selection - Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getReasonIcon(form.reason)} What can we help you with? *
              </label>
              <select
                name="reason"
                value={form.reason}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 bg-white"
              >
                {reasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 Your Message *
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none text-gray-800 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Characters: {form.message.length}/1000
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Sending Message...
                  </div>
                ) : (
                  <>🚀 Send Message</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="mt-6 bg-green-100 border border-green-300 text-green-700 px-6 py-4 rounded-xl text-center animate-fade-in">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-semibold">Message Sent Successfully!</p>
            <p className="text-sm">We'll get back to you within 24 hours.</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center animate-fade-in">
            <div className="text-2xl mb-2">❌</div>
            <p className="font-semibold">Failed to Send Message</p>
            <p className="text-sm">Please try again or contact us directly.</p>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @media (max-width: 640px) {
          .grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ContactUs;