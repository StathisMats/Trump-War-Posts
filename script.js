// Updates the system clock and live elapsed times every second
function updateLiveClocks() {
    // 1. Update the top right clock
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        timeZone: 'UTC', 
        hour12: false 
    });
    document.getElementById('system-clock').textContent = timeString + ' GMT';

    // 2. Update all the elapsed times in the feed
    const elapsedElements = document.querySelectorAll('.live-elapsed');
    elapsedElements.forEach(el => {
        const postTimestamp = el.getAttribute('data-timestamp');
        if(postTimestamp) {
            el.textContent = calculateElapsed(postTimestamp, now);
        }
    });
}
// Run immediately, then loop every second
updateLiveClocks();
setInterval(updateLiveClocks, 1000);

// Calculates the time passed and formats to the 2 largest relevant units
function calculateElapsed(postDateStr, now = new Date()) {
    const postDate = new Date(postDateStr);
    const diffMs = now - postDate;

    if (diffMs < 0) return "0s"; // Failsafe for future dates

    const diffSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSecs / 86400);
    const hours = Math.floor((diffSecs % 86400) / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);
    const seconds = diffSecs % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    // Include seconds if it's > 0, OR if everything else is 0 (so it doesn't stay blank)
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    // Only return the two largest non-zero metrics 
    return parts.slice(0, 2).join(' ');
}

// Formats "Jun 02, 2026, 1:29 AM GMT" into a tighter terminal format "1:29 AM"
function formatTime(timeString) {
    try {
        const parts = timeString.split(', ');
        if (parts.length === 3) {
            // Returns just the time portion, removing " GMT" from the column string as it's in the header
            return parts[2].replace(' GMT', ''); 
        }
        return timeString;
    } catch (e) {
        return timeString;
    }
}

// Emphasize fully capitalized words in the text
function parseTextForTraders(text) {
    return text.replace(/\b([A-Z]{3,})\b/g, '<b>$1</b>');
}

// Builds the HTML for a single row
function createFeedRow(post) {
    const formattedTime = formatTime(post.time);
    const formattedText = parseTextForTraders(post.text);
    // Calculate initial elapsed time
    const initialElapsed = calculateElapsed(post.time);

    return `
        <div class="feed-row">
            <div class="col-time">${formattedTime}</div>
            <div class="col-elapsed live-elapsed" data-timestamp="${post.time}">${initialElapsed}</div>
            <div class="col-source">
                <span class="badge">TRUTH</span>
            </div>
            <div class="col-text">${formattedText}</div>
        </div>
    `;
}

// Main function to fetch and render
async function initFeed() {
    const feedBody = document.getElementById('feed-body');
    
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        feedBody.innerHTML = ''; // Clear loading state
        
        // Build and append all posts
        posts.forEach(post => {
            feedBody.innerHTML += createFeedRow(post);
        });

    } catch (error) {
        feedBody.innerHTML = `
            <div style="padding: 1rem; color: #ef4444; font-family: monospace;">
                [SYS_ERR] UNABLE TO ESTABLISH DATALINK. VERIFY LOCALHOST/GITHUB PAGES CONFIG.
            </div>
        `;
        console.error("Data fetch failed:", error);
    }
}

// Boot up the feed
initFeed();