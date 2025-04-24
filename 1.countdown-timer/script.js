// Complete New Year Timer Solution

// Function to initialize the countdown timer
function initCountdown() {
    const DEBUG = true; // Set to false in production
    
    // Reference all countdown elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('mins');
    const secondsEl = document.getElementById('seconds');
    const yearDisplayEl = document.getElementById('year-display');
    
    // Check if critical elements exist
    if (!daysEl || !hoursEl || !minsEl || !secondsEl) {
        console.error('Error: One or more countdown elements (days, hours, mins, seconds) not found in the DOM');
        return;
    }
    
    if (DEBUG) {
        console.log("Elements:", { daysEl, hoursEl, minsEl, secondsEl, yearDisplayEl });
    }
    
    // Function to calculate next New Year
    function getNextNewYear() {
        const now = new Date();
        return new Date(now.getFullYear() + 1, 0, 1); // January 1st of next year
    }
    
    // Target date for the countdown
    let nextNewYear = getNextNewYear();
    if (DEBUG) {
        console.log("Counting down to:", nextNewYear.toLocaleString());
    }
    
    // Update target year display if element exists
    if (yearDisplayEl) {
        yearDisplayEl.textContent = nextNewYear.getFullYear();
    }
    
    // Track previous values to avoid unnecessary DOM updates
    let prevValues = { days: null, hours: null, mins: null, seconds: null };
    
    // Function to update the countdown values
    function updateCountdown() {
        const now = new Date();
        
        // Check if countdown has passed
        if (now >= nextNewYear) {
            nextNewYear = getNextNewYear();
            if (yearDisplayEl) {
                yearDisplayEl.textContent = nextNewYear.getFullYear();
            }
        }
        
        // Time difference in milliseconds
        const diff = nextNewYear - now;
        
        // Stop if negative
        if (diff <= 0) {
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minsEl) daysEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            return;
        }
        
        // Convert to time units
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Format numbers (add leading zeros)
        const formatNumber = (num) => num < 10 ? `0${num}` : num;
        
        // Update DOM only if values changed
        if (
            prevValues.days !== days ||
            prevValues.hours !== hours ||
            prevValues.mins !== mins ||
            prevValues.seconds !== seconds
        ) {
            if (daysEl) daysEl.textContent = formatNumber(days);
            if (hoursEl) hoursEl.textContent = formatNumber(hours);
            if (minsEl) minsEl.textContent = formatNumber(mins);
            if (secondsEl) secondsEl.textContent = formatNumber(seconds);
            
            prevValues = { days, hours, mins, seconds };
            
            if (DEBUG) {
                console.log(`Countdown: ${formatNumber(days)}:${formatNumber(hours)}:${formatNumber(mins)}:${formatNumber(seconds)}`);
            }
        }
    }
    
    // Initial update
    updateCountdown();
    
    // Set interval to update every second
    const intervalId = setInterval(updateCountdown, 1000);
    
    // Cleanup on page unload
    window.addEventListener('unload', () => clearInterval(intervalId));
    
    return intervalId;
}

// Start the countdown when the document is loaded
document.addEventListener('DOMContentLoaded', initCountdown);