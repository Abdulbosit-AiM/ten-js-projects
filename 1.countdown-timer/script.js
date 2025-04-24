// Complete New Year Timer Solution

// Function to initialize the countdown timer
function initCountdown() {
    // Reference all countdown elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('mins');
    const secondsEl = document.getElementById('seconds');
    const yearDisplayEl = document.getElementById('year-display');
    
    // Log elements to check if they're found correctly
    console.log("Elements:", { daysEl, hoursEl, minsEl, secondsEl, yearDisplayEl });
    
    // Function to calculate next New Year
    function getNextNewYear() {
        const now = new Date();
        return new Date(now.getFullYear() + 1, 0, 1); // January 1st of next year
    }
    
    // Target date for the countdown
    const nextNewYear = getNextNewYear();
    console.log("Counting down to:", nextNewYear.toLocaleString());
    
    // Update target year display if element exists
    if (yearDisplayEl) {
        yearDisplayEl.textContent = nextNewYear.getFullYear();
    }
    
    // Function to update the countdown values
    function updateCountdown() {
        // Current time
        const now = new Date();
        
        // Time difference in milliseconds
        const diff = nextNewYear - now;
        
        // Convert to time units
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Format numbers (add leading zeros)
        const formatNumber = (num) => num < 10 ? `0${num}` : num;
        
        // Update DOM (with null checks)
        if (daysEl) daysEl.textContent = formatNumber(days);
        if (hoursEl) hoursEl.textContent = formatNumber(hours);
        if (minsEl) minsEl.textContent = formatNumber(mins);
        if (secondsEl) secondsEl.textContent = formatNumber(seconds);
        
        // Log current values for debugging
        console.log(`Countdown: ${formatNumber(days)}:${formatNumber(hours)}:${formatNumber(mins)}:${formatNumber(seconds)}`);
    }
    
    // Initial update
    updateCountdown();
    
    // Set interval to update every second
    return setInterval(updateCountdown, 1000);
}

// Start the countdown when the document is loaded
document.addEventListener('DOMContentLoaded', initCountdown);

// Alternative: If you're adding this script at the end of your HTML body
// or if DOMContentLoaded has already fired, call initCountdown directly
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initCountdown();
}