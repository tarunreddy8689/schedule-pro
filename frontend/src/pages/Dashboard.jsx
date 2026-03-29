import { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({
    days: "",
    startTime: "",
    endTime: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [bookings, setBookings] = useState([]);

  // Load real bookings from API
  const loadBookings = async () => {
    try {
      console.log("Loading bookings for user:", user._id);
      const res = await API.get(`/bookings/${user._id}`);
      console.log("Bookings response:", res.data);
      console.log("Response status:", res.status);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      console.error("Request URL:", `/bookings/${user._id}`);
      
      // If no bookings or API fails, show empty state
      setBookings([]);
    }
  };

  useEffect(() => {
    // Load existing availability
    const loadAvailability = async () => {
      try {
        const res = await API.get(`/availability/${user.username}`);
        if (res.data && res.data.availability) {
          setAvailability({
            days: res.data.availability.days?.join(",") || "",
            startTime: res.data.availability.startTime || "",
            endTime: res.data.availability.endTime || ""
          });
        }
      } catch (err) {
        // Availability not set yet, that's okay
      }
    };

    loadAvailability();
    loadBookings();
  }, [user.username, user._id]);

  // Refresh bookings when page gains focus (user navigates back from booking page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadBookings();
      }
    };

    const handleFocus = () => {
      loadBookings();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user._id]);

  const handleSave = async () => {
    if (!availability.days || !availability.startTime || !availability.endTime) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    
    try {
      await API.post("/availability", {
        userId: user._id,
        days: availability.days.split(",").map(day => day.trim()),
        startTime: availability.startTime,
        endTime: availability.endTime
      });

      setSuccessMessage("Availability saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save availability");
    } finally {
      setIsLoading(false);
    }
  };

  const copyBookingLink = () => {
    const link = `http://localhost:5173/book/${user.username}`;
    navigator.clipboard.writeText(link);
  };

  // Add refresh function for bookings
  const refreshBookings = async () => {
    try {
      const res = await API.get(`/bookings/${user._id}`);
      setBookings(res.data || []);
    } catch (err) {
      setBookings([]);
    }
  };

  // Handle booking card click
  const handleBookingClick = (booking) => {
    // Navigate to booking page with the host's username
    navigate(`/book/${user.username}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="heading-primary">Welcome back, {user.name || user.username}!</h1>
          <p className="text-muted">Manage your availability and bookings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Availability Settings */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-secondary">Availability Settings</h2>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="form-section">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Available Days
                  </label>
                  <input 
                    placeholder="e.g., Monday,Tuesday,Wednesday"
                    className="input-modern"
                    value={availability.days}
                    onChange={(e) => setAvailability({...availability, days: e.target.value})}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate multiple days with commas</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Time
                    </label>
                    <input 
                      placeholder="09:00"
                      className="input-modern"
                      value={availability.startTime}
                      onChange={(e) => setAvailability({...availability, startTime: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Time
                    </label>
                    <input 
                      placeholder="17:00"
                      className="input-modern"
                      value={availability.endTime}
                      onChange={(e) => setAvailability({...availability, endTime: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleSave}
                  className="btn-primary"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Availability"
                  )}
                </motion.button>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    className="alert-success mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm font-medium">{successMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Booking Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-secondary">Booking Link</h2>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-600 mb-2">Share this link with clients:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`http://localhost:5173/book/${user.username}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                  <motion.button
                    onClick={copyBookingLink}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Book Appointment Button */}
              <motion.button
                onClick={() => navigate(`/book/${user.username}`)}
                className="w-full btn-primary bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Book an Appointment</span>
              </motion.button>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Total Bookings</span>
                  <span className="text-lg font-bold text-blue-600">{bookings.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-emerald-900">Confirmed</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-amber-900">Pending</span>
                  <span className="text-lg font-bold text-amber-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Bookings */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-secondary">Recent Bookings</h2>
              <motion.button
                onClick={refreshBookings}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">Refresh</span>
              </motion.button>
            </div>
            
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    className="booking-card cursor-pointer hover:shadow-blue-500/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
                    onClick={() => handleBookingClick(booking)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {booking.guestName?.charAt(0)?.toUpperCase() || 'G'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="mb-2">
                            <p className="font-semibold text-slate-900 text-lg">{booking.guestName || 'Guest'}</p>
                            <p className="text-sm text-slate-600 font-medium">{booking.guestEmail || 'No email provided'}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-slate-600">
                                <span className="font-medium">Date:</span> {booking.date || 'Not set'}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm text-slate-600">
                                <span className="font-medium">Time:</span> {booking.time || 'Not set'}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <p className="text-sm text-slate-600">
                                <span className="font-medium">Booking ID:</span> #{booking.id || 'N/A'}
                              </p>
                            </div>

                            {booking.createdAt && (
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Booked on:</span> {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : booking.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status || 'unknown'}
                        </span>
                        
                        {booking.status === 'pending' && (
                          <motion.button
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Confirm
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">No bookings yet</p>
                <p className="text-sm text-slate-400 mt-1">Share your booking link to get started</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}