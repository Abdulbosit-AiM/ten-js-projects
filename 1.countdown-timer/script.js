// Completely revised New Year Timer that correctly counts to the next upcoming New Year

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
    
    // Create date for this year's New Year (January 1st of current year)
    const thisNewYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    
    // Create date for next year's New Year (January 1st of next year)
    const nextNewYear = new Date(currentYear + 1, 0, 1, 0, 0, 0, 0);
    
    // If current date is before this year's New Year, count to this year
    // Otherwise count to next year
    return now < thisNewYear ? thisNewYear : nextNewYear;
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
    
    // Calculate remaining time
    const timeDiff = newYearDate - now;
    
    // Handle case when countdown reaches zero
    if (timeDiff <= 0) {
        // Show celebration message or animation
        daysEl.innerHTML = "00";
        hoursEl.innerHTML = "00";
        minsEl.innerHTML = "00";
        secondsEl.innerHTML = "00";
        
        // Refresh the page after a short delay to reset the countdown
        setTimeout(() => {
            location.reload();
        }, 10000); // Reload after 10 seconds of celebration
        
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
}

// Function to add leading zeros
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Initial call to set up the countdown target
updateCountdown();

// Update the countdown every second
setInterval(updateCountdown, 1000);

// Log the target date to console for debugging
console.log("Counting down to:", getNextNewYear().toString());