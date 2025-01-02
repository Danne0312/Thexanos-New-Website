const YOUTUBE_API_KEY = 'YOUR_API_KEY'; // You'll need to get this from Google Cloud Console
const CHANNEL_ID = 'UC1oFCSY-duAUIaXpmKPfRfA';
const MAX_RESULTS = 6;
const TWITCH_CLIENT_ID = 'YOUR_TWITCH_CLIENT_ID';
const TWITCH_CLIENT_SECRET = 'YOUR_TWITCH_CLIENT_SECRET';
const TWITCH_USERNAME = 'thexanos';

async function fetchLatestVideos() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}`
        );
        const data = await response.json();
        displayVideos(data.items);
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
    }
}

function displayVideos(videos) {
    const container = document.getElementById('youtube-videos');
    container.innerHTML = '';

    videos.forEach(video => {
        if (video.id.videoId) {
            const videoElement = createVideoElement(video);
            container.appendChild(videoElement);
        }
    });
}

function createVideoElement(video) {
    const div = document.createElement('div');
    div.className = 'youtube-video';
    
    const date = new Date(video.snippet.publishedAt).toLocaleDateString();
    
    div.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">
            <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
            <div class="video-info">
                <h3>${video.snippet.title}</h3>
                <p>${date}</p>
            </div>
        </a>
    `;
    
    return div;
}

async function getTwitchAccessToken() {
    try {
        const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, {
            method: 'POST'
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting Twitch access token:', error);
    }
}

async function getUserId(accessToken) {
    try {
        const response = await fetch(`https://api.twitch.tv/helix/users?login=${TWITCH_USERNAME}`, {
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        return data.data[0].id;
    } catch (error) {
        console.error('Error getting user ID:', error);
    }
}

async function fetchLatestClips() {
    try {
        const accessToken = await getTwitchAccessToken();
        const userId = await getUserId(accessToken);
        
        const response = await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=6`, {
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        displayClips(data.data);
    } catch (error) {
        console.error('Error fetching Twitch clips:', error);
    }
}

function displayClips(clips) {
    const container = document.getElementById('twitch-clips');
    container.innerHTML = '';

    clips.forEach(clip => {
        const clipElement = createClipElement(clip);
        container.appendChild(clipElement);
    });
}

function createClipElement(clip) {
    const div = document.createElement('div');
    div.className = 'twitch-clip';
    
    const date = new Date(clip.created_at).toLocaleDateString();
    
    div.innerHTML = `
        <iframe
            src="https://clips.twitch.tv/embed?clip=${clip.id}&parent=${window.location.hostname}"
            height="200"
            width="100%"
            allowfullscreen>
        </iframe>
        <div class="clip-info">
            <h3>${clip.title}</h3>
            <p>${date}</p>
        </div>
    `;
    
    return div;
}

class WheelOfFortune {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.options = [
            'Watch the stream',
            'Watch the stream',
            'Watch the stream',
            'WIN VIP! 💎',
            'Watch the stream',
            'Watch the stream'
        ];
        this.startAngle = 0;
        this.isSpinning = false;
        
        document.getElementById('spin-btn').addEventListener('click', () => this.spin());
    }

    drawWheel() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Calculate total angle excluding the small slice
        const regularSlice = 2 * Math.PI / 5.5;  // Adjusted for 5.5 segments instead of 6
        const smallSlice = regularSlice / 2;    // Half size for prize slice
        const totalAngle = 2 * Math.PI;         // Complete circle

        // Draw wheel segments
        let currentAngle = this.startAngle;
        for (let i = 0; i < this.options.length; i++) {
            // Determine slice size
            const sliceSize = this.options[i] === 'WIN VIP! 💎' ? smallSlice : regularSlice;
            
            // Draw slice
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceSize);
            this.ctx.fillStyle = i % 2 ? '#483D8B' : '#6A5ACD';
            this.ctx.fill();
            
            // Draw text
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(currentAngle + sliceSize / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(this.options[i], radius - 10, 5);
            this.ctx.restore();

            // Update current angle
            currentAngle += sliceSize;
        }

        // Draw pointer
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 10, 10);
        this.ctx.lineTo(centerX + 10, 10);
        this.ctx.lineTo(centerX, 25);
        this.ctx.closePath();
        this.ctx.fillStyle = '#8A2BE2';
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    spin() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        const spins = 20;
        const duration = 20000;
        const startTime = performance.now();
        const startAngle = this.startAngle;
        
        // Calculate a safe landing angle that avoids the VIP segment
        const vipSegmentStart = 3 * (2 * Math.PI / 5.5); // Start of VIP segment
        const vipSegmentEnd = vipSegmentStart + (2 * Math.PI / 11); // End of VIP segment
        
        // Generate a random angle that's not in the VIP segment
        let randomAngle;
        do {
            randomAngle = Math.random() * 2 * Math.PI;
        } while (randomAngle > vipSegmentStart - 0.2 && randomAngle < vipSegmentEnd + 0.2); // Added buffer
        
        const totalRotation = (spins * 2 * Math.PI) + randomAngle;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easing = 1 - Math.pow(1 - progress, 3);
            
            this.startAngle = startAngle + totalRotation * easing;
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
            }
        };

        requestAnimationFrame(animate);
    }
}

// Initialize the wheel when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchLatestVideos();
    fetchLatestClips();
    const wheel = new WheelOfFortune();
    wheel.drawWheel();
}); 
