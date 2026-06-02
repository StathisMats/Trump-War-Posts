// Updates the system clock in the top right to simulate a live terminal in GMT
function updateClock() {

    const now = new Date();
    // Forces the time to output in UTC/GMT
    const timeString = now.toLocaleTimeString('en-US', { 
        timeZone: 'UTC', 
        hour12: false 
    });
    document.getElementById('system-clock').textContent = timeString + ' GMT';




































}
setInterval(updateClock, 1000);
updateClock();

// Formats "Jun 02, 2026, 1:29 AM GMT" into a tighter terminal format "1:29 AM GMT"
function formatTime(timeString) {
    try {
        const parts = timeString.split(', ');
        if (parts.length === 3) {
            // Returns just the time portion
            return parts[2];
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

// Builds the HTML for a single row without engagement stats
function createFeedRow(post) {
    const formattedTime = formatTime(post.time);
    const formattedText = parseTextForTraders(post.text);



    return `
        <div class="feed-row">
            <div class="col-time">${formattedTime}</div>

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