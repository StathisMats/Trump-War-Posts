// Updates the system clock and live lapsed times
function updateClock() {
    const now        = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        timeZone: 'UTC', 
        hour12  : false 
    });
    
    document.getElementById('system-clock').textContent = timeString + ' GMT';

    // Live update the lapsed time column for all loaded posts
    document.querySelectorAll('.time-lapsed-cell').forEach(cell => {
        const postTime   = cell.getAttribute('data-time');
        cell.textContent = getTimeLapsed(postTime);
    });
}

setInterval(updateClock, 1000);
updateClock();

// Calculates dynamically formatted time since post
function getTimeLapsed(timeString) {
    const postDate = new Date(timeString);
    const now      = new Date();
    let diffMs     = now - postDate;

    // Failsafe for dates in the future (keeps UI clean)
    if (diffMs < 0) diffMs = 0; 

    const diffSecs  = Math.floor(diffMs / 1000);
    const diffMins  = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays  = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
        return `${diffHours}h ${diffMins % 60}m`;
    } else if (diffMins > 0) {
        return `${diffMins}m ${diffSecs % 60}s`;
    } else {
        return `${diffSecs}s`;
    }
}

// Formats "Jun 02, 2026, 1:29 AM GMT" into "Jun 02, 2026, 1:29 AM"
function formatDate(timeString) {
    if (!timeString) return '';
    return timeString.replace(' GMT', '');
}

// Emphasize fully capitalized words in the text
function parseTextForTraders(text) {
    return text.replace(/\b([A-Z]{3,})\b/g, '<b>$1</b>');
}

// Toggles the summary display state
window.toggleSummary = function(button) {
    const content = button.nextElementSibling;

    if (content.style.display === "none") {
        content.style.display = "block";
        button.textContent = "▼ HIDE SUMMARY";
    } else {
        content.style.display = "none";
        button.textContent = "▶ SHOW SUMMARY";
    }
};

// Builds the HTML for a single row including new requirements
function createFeedRow(post) {
    const formattedDate = formatDate(post.time);
    const formattedText = parseTextForTraders(post.text);
    const initialLapsed = getTimeLapsed(post.time);

    return `
        <div class="feed-row">
            <div class="col-date">${formattedDate}</div>
            <div class="col-lapsed time-lapsed-cell" data-time="${post.time}">${initialLapsed}</div>
            <div class="col-source">
                <span class="badge">TRUTH</span>
            </div>
            <div class="col-text">
                ${formattedText}
                <div class="summary-container">
                    <button class="summary-toggle" onclick="toggleSummary(this)">▶ SHOW SUMMARY</button>
                    <div class="summary-content" style="display: none;">
                        ${post.summary}
                    </div>
                </div>
            </div>
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

        const posts        = await response.json();
        feedBody.innerHTML = ''; 

        posts.forEach(post => {
            feedBody.innerHTML += createFeedRow(post);
        });

    } catch (error) {
        feedBody.innerHTML = `
            <div style="padding: 1rem; color: #ef4444; font-family: monospace;">
                ERROR ESTABLISHING DATALINK: ${error.message}
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initFeed);
