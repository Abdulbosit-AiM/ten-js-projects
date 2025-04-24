// Dynamic New Year Timer that always counts to the next upcoming New Year

// Get DOM elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minsEl = document.getElementById('mins');
const secondsEl = document.getElementById('seconds');
const yearDisplay = document.getElementById('year-display'); // Element to display the target year

// Function to get the next New Year date
function getNextNewYear() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Create a date object for January 1st of next year
    const nextNewYear = new Date(currentYear + 1, 0, 1); // Month is 0-indexed, so 0 = January
    
    // Check if we've already passed New Year's day of the current year
    // If we're currently in January 1st, we count to next year
    if (currentDate.getMonth() === 0 && currentDate.getDate() === 1) {
        // If it's January 1st, count to next year
        nextNewYear.setFullYear(currentYear + 1);
    }
    
    return nextNewYear;
}

// Function to update the countdown
function updateCountdown() {
    const currentDate = new Date();
    const newYearDate = getNextNewYear();
    
    // Display the target year
    const targetYear = newYearDate.getFullYear();
    if (yearDisplay) {
        yearDisplay.textContent = targetYear;
    }
    
    // Calculate remaining time
    const totalSeconds = (newYearDate - currentDate) / 1000;
    
    // Handle case when New Year has been reached
    if (totalSeconds <= 0) {
        // Refresh to get the new target year
        setTimeout(() => {
            updateCountdown();
        }, 1000);
        return;
    }
    
    const days = Math.floor(totalSeconds / 3600 / 24);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = Math.floor(totalSeconds) % 60;
    
    // Update the DOM
    daysEl.innerHTML = formatTime(days);
    hoursEl.innerHTML = formatTime(hours);
    minsEl.innerHTML = formatTime(minutes);
    secondsEl.innerHTML = formatTime(seconds);
}

// Function to add leading zeros
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Initial update
updateCountdown();

// Update the countdown every second
setInterval(updateCountdown, 1000);
