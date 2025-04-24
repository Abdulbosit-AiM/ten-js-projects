// New Year Timer with proper countdown for all time units

// Get DOM elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minsEl = document.getElementById('mins');
const secondsEl = document.getElementById('seconds');
const yearDisplay = document.getElementById('year-display'); // Element to display the target year

// Function to get the next New Year date
function getNextNewYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Create date for next year's New Year
    const nextNewYear = new Date(currentYear + 1, 0, 1, 0, 0, 0, 0);
    
    return nextNewYear;
}

// Function to update the countdown
function updateCountdown() {
    const now = new Date();
    const newYearDate = getNextNewYear();
    
    // Display the target year
    const targetYear = newYearDate.getFullYear();
    if (yearDisplay) {
        yearDisplay.textContent = targetYear;
    }
    
    // Calculate remaining time in milliseconds
    const timeDiff = newYearDate - now;
    
    // Handle case when countdown reaches zero
    if (timeDiff <= 0) {
        daysEl.innerHTML = "00";
        hoursEl.innerHTML = "00";
        minsEl.innerHTML = "00";
        secondsEl.innerHTML = "00";
        
        // Refresh the page after a short delay to reset the countdown
        setTimeout(() => {
            location.reload();
        }, 10000); // Reload after 10 seconds
        
        return;
    }
    
    // Calculate all time components
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Update the DOM with proper formatting
    daysEl.innerHTML = formatTime(days);
    hoursEl.innerHTML = formatTime(hours);
    minsEl.innerHTML = formatTime(minutes);
    secondsEl.innerHTML = formatTime(seconds);
    
    // Log for debugging
    console.log(`${formatTime(days)}:${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`);
}

// Function to add leading zeros
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Initial call
updateCountdown();

// Update the countdown EVERY SECOND
setInterval(updateCountdown, 1000);

// For debugging - log the target date
console.log("Target New Year:", getNextNewYear().toLocaleString());