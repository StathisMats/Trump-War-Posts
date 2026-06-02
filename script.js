// Updates the system clock and live elapsed times every second
function updateLiveClocks() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        timeZone: 'UTC', 
        hour12: false 
    });
    document.getElementById('system-clock').textContent = timeString + ' GMT';

    const elapsedElements = document.querySelectorAll('.live-elapsed');
    elapsedElements.forEach(el => {
        const postTimestamp = el.getAttribute('data-timestamp');
        if(postTimestamp) {
            el.textContent = calculateElapsed(postTimestamp, now);
        }
    });
}
updateLiveClocks();
setInterval(updateLiveClocks, 1000);

function calculateElapsed(postDateStr, now = new Date()) {
    const postDate = new Date(postDateStr);
    const diffMs = now - postDate;
    if (diffMs < 0) return "0s";

    const diffSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSecs / 86400);
    const hours = Math.floor((diffSecs % 86400) / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);
    const seconds = diffSecs % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.slice(0, 2).join(' ');
}

function formatTime(timeString) {
    try {
        const parts = timeString.split(', ');
        if (parts.length === 3) return parts[2].replace(' GMT', ''); 
        return timeString;
    } catch (e) { return timeString; }
}

function parseTextForTraders(text) {
    return text.replace(/\b([A-Z]{3,})\b/g, '<b>$1</b>');
}

// Function to handle the collapse logic
function toggleSummary(element) {
    const content = element.querySelector('.summary-content');
    const toggle = element.querySelector('.summary-toggle');
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        toggle.textContent = "[-] Hide Summary";
    } else {
        content.style.display = "none";
        toggle.textContent = "[+] Show Summary";
    }
}

function createFeedRow(post) {
    const formattedTime = formatTime(post.time);
    const formattedText = parseTextForTraders(post.text);
    const initialElapsed = calculateElapsed(post.time);

    return `
        <div class="feed-row" onclick="toggleSummary(this)">
            <div class="col-time">${formattedTime}</div>
            <div class="col-elapsed live-elapsed" data-timestamp="${post.time}">${initialElapsed}</div>
            <div class="col-source"><span class="badge">TRUTH</span></div>
            <div class="col-text">
                ${formattedText}
                <div class="summary-toggle">[+] Show Summary</div>
                <div class="summary-content" style="display:none;">${post.summary}</div>
            </div>
        </div>
    `;
}

async function initFeed() {
    const feedBody = document.getElementById('feed-body');
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const posts = await response.json();
        feedBody.innerHTML = '';
        posts.forEach(post => { feedBody.innerHTML += createFeedRow(post); });
    } catch (error) {
        feedBody.innerHTML = `<div style="padding: 1rem; color: #ef4444; font-family: monospace;">[SYS_ERR] UNABLE TO ESTABLISH DATALINK.</div>`;
        console.error("Data fetch failed:", error);
    }
}
initFeed();