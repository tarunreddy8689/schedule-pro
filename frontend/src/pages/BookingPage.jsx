import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    date: "",
    time: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const res = await API.get(`/availability/${username}`);
        setData(res.data);
      } catch (err) {
        setError("Unable to load availability. Please try again later.");
      }
    };

    loadAvailability();
  }, [username]);

  // Generate time slots based on availability
  const generateTimeSlots = () => {
    if (!data.availability) return [];
    
    const { startTime, endTime } = data.availability;
    const slots = [];
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  };

  const handleBook = async () => {
    // Reset errors
    setError("");
    
    // Validate guest name
    if (!form.guestName || form.guestName.trim().length < 2) {
      setError("Please enter a valid name (at least 2 characters)");
      return;
    }
    
    if (form.guestName.trim().length > 50) {
      setError("Name is too long (maximum 50 characters)");
      return;
    }

    // Validate guest email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.guestEmail || !emailRegex.test(form.guestEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate date selection
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    // Enhanced date validation
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    
    const selectedYear = selectedDateObj.getFullYear();
    const currentYear = new Date().getFullYear();
    
    // Check if date is in the past
    if (selectedDateObj < today) {
      setError("Cannot book appointments in the past. Please select a future date.");
      return;
    }
    
    // Check year range (current year to current year + 2)
    if (selectedYear < currentYear || selectedYear > currentYear + 2) {
      setError(`Please select a date between ${currentYear} and ${currentYear + 2}`);
      return;
    }

    // Validate time slot selection
    if (!selectedTimeSlot) {
      setError("Please select a time slot");
      return;
    }

    setIsLoading(true);
    
    try {
      await API.post("/book", {
        hostId: data.user._id,
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim(),
        date: selectedDate,
        time: selectedTimeSlot
      });

      setSuccessMessage("Appointment booked successfully! Redirecting to dashboard...");
      setForm({ guestName: "", guestEmail: "", date: "", time: "" });
      setSelectedTimeSlot("");
      setSelectedDate("");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
        // Force a page refresh to ensure booking data is updated
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Booking error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError("Failed to book appointment. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (name) => {
    // Real-time name validation
    if (name && name.trim().length >= 2 && name.trim().length <= 50) {
      setError("");
    }
    setForm({ ...form, guestName: name });
  };

  const handleEmailChange = (email) => {
    // Real-time email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email)) {
      setError("");
    }
    setForm({ ...form, guestEmail: email });
  };

  const handleTimeSlotSelect = (time) => {
    setSelectedTimeSlot(time);
    setForm({ ...form, time });
    if (time) {
      setError("");
    }
  };

  const handleDateChange = (date) => {
    // Real-time date validation
    if (date) {
      const selectedDateObj = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedYear = selectedDateObj.getFullYear();
      const currentYear = new Date().getFullYear();
      
      // Clear error if valid date
      if (selectedDateObj >= today && selectedYear >= currentYear && selectedYear <= currentYear + 2) {
        setError("");
      }
    }
    
    setSelectedDate(date);
    setForm({ ...form, date });
    setSelectedTimeSlot(""); // Reset time slot when date changes
  };

  const timeSlots = generateTimeSlots();
  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const maxDate = new Date(currentYear + 2, 11, 31).toISOString().split('T')[0]; // End of year currentYear + 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.div
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900">SchedulePro</span>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Host Info */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-2xl">
              {data.user?.name?.charAt(0)?.toUpperCase() || username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="heading-primary">Book with {data.user?.name || username}</h1>
          <p className="text-muted">Select a convenient time slot for your appointment</p>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="alert-error mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="alert-success mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-medium">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="card">
              <h2 className="heading-secondary mb-6">Your Information</h2>
              
              <div className="form-section">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="input-modern"
                    value={form.guestName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-modern"
                    value={form.guestEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    max={maxDate}
                    className="input-modern"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {selectedDate && selectedTimeSlot && (
                  <motion.div
                    className="bg-blue-50 rounded-xl p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm font-medium text-blue-900">Selected Time:</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedDate} at {selectedTimeSlot}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  onClick={handleBook}
                  className="btn-success"
                  disabled={isLoading || !selectedDate || !selectedTimeSlot}
                  whileHover={{ scale: (isLoading || !selectedDate || !selectedTimeSlot) ? 1 : 1.02 }}
                  whileTap={{ scale: (isLoading || !selectedDate || !selectedTimeSlot) ? 1 : 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    "Book Appointment"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Time Slot Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="card">
              <h2 className="heading-secondary mb-6">Available Time Slots</h2>
              
              {!selectedDate ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-medium">Select a date first</p>
                  <p className="text-sm text-slate-400 mt-1">Choose a date to see available time slots</p>
                </div>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time, index) => (
                    <motion.button
                      key={time}
                      className={`time-slot ${
                        selectedTimeSlot === time ? 'time-slot-selected' : ''
                      }`}
                      onClick={() => handleTimeSlotSelect(time)}
                      disabled={isLoading}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ scale: isLoading ? 1 : 1.05 }}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-medium">No availability set</p>
                  <p className="text-sm text-slate-400 mt-1">The host hasn't set their availability yet</p>
                </div>
              )}

              {/* Availability Info */}
              {data.availability && (
                <motion.div
                  className="mt-6 p-4 bg-slate-50 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <p className="text-sm font-medium text-slate-700 mb-2">Availability:</p>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Days:</span> {data.availability.days?.join(', ') || 'Not set'}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Hours:</span> {data.availability.startTime} - {data.availability.endTime}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}