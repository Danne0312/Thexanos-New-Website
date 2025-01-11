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

    // Add the specific video from the provided link
    const specificVideo = {
        id: { videoId: 'isD7j-SRVGA' },
        snippet: {
            title: 'Thexanos Music', // Replace with the actual title
            thumbnails: {
                high: {
                    url: 'https://img.youtube.com/vi/isD7j-SRVGA/hqdefault.jpg' // Thumbnail URL
                }
            }
        }
    };

    // Append the specific video first
    const specificVideoElement = createVideoElement(specificVideo);
    container.appendChild(specificVideoElement);

    // Then append the fetched videos
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
    
    div.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">
            <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
            <div class="video-info">
                <h3>${video.snippet.title}</h3>
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
        this.rotationSpeed = 0.02;
        this.scale = 1;
        this.yOffset = 0;
        this.opacity = 1;
        
        this.colors = {
            primary: ['#4B0082', '#663399'],    // Deep purple alternating
            vip: ['#FFD700', '#FFA500'],        // Gold gradient for VIP
            border: '#B8860B',                  // Dark gold border
            text: '#FFFFFF',                    // White text
            pointer: '#FF4500',                 // Orange-red pointer
            shine: 'rgba(255, 255, 255, 0.2)'   // White shine effect
        };
        
        // Start normal spinning animation
        this.animate();
        
        document.getElementById('spin-btn').addEventListener('click', () => {
            if (!this.isSpinning) {
                this.startSpinAway();
            }
        });

        // Add a method to check which option the pointer is pointing at
        this.currentSegment = null;
    }

    animate() {
        if (this.isSpinning) return; // Don't continue normal animation if spinning away
        
        this.startAngle += this.rotationSpeed;
        this.drawWheel();
        requestAnimationFrame(() => this.animate());
    }

    drawWheel() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transformations
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2 - this.yOffset);
        this.ctx.scale(this.scale, this.scale);
        
        const radius = Math.min(this.canvas.width / 2, this.canvas.height / 2) - 20;
        
        // Enhanced outer metallic ring with multiple gradients
        const outerGradient = this.ctx.createLinearGradient(-radius, -radius, radius, radius);
        outerGradient.addColorStop(0, '#FFD700');    // Gold
        outerGradient.addColorStop(0.3, '#FFF8DC');  // Light gold
        outerGradient.addColorStop(0.5, '#FFD700');  // Gold
        outerGradient.addColorStop(0.7, '#FFF8DC');  // Light gold
        outerGradient.addColorStop(1, '#FFD700');    // Gold
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
        this.ctx.strokeStyle = outerGradient;
        this.ctx.lineWidth = 10;
        this.ctx.stroke();

        // Draw segments with enhanced gradients
        const regularSlice = 2 * Math.PI / 5.5;
        const smallSlice = regularSlice / 2;
        let currentAngle = this.startAngle;

        for (let i = 0; i < this.options.length; i++) {
            const sliceSize = this.options[i] === 'WIN VIP! 💎' ? smallSlice : regularSlice;
            
            // Create enhanced segment gradient
            const segmentGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            if (this.options[i] === 'WIN VIP! 💎') {
                segmentGradient.addColorStop(0, '#FFD700');      // Center gold
                segmentGradient.addColorStop(0.5, '#FFA500');    // Middle orange-gold
                segmentGradient.addColorStop(1, '#B8860B');      // Edge darker gold
            } else {
                segmentGradient.addColorStop(0, this.colors.primary[i % 2]);
                segmentGradient.addColorStop(0.7, this.darkenColor(this.colors.primary[i % 2], 20));
                segmentGradient.addColorStop(1, this.darkenColor(this.colors.primary[i % 2], 40));
            }

            // Draw base segment
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, currentAngle, currentAngle + sliceSize);
            this.ctx.lineTo(0, 0);
            this.ctx.fillStyle = segmentGradient;
            this.ctx.fill();
            
            // Add shine effect
            const shineGradient = this.ctx.createRadialGradient(
                Math.cos(currentAngle + sliceSize/2) * radius/2,
                Math.sin(currentAngle + sliceSize/2) * radius/2,
                0,
                Math.cos(currentAngle + sliceSize/2) * radius/2,
                Math.sin(currentAngle + sliceSize/2) * radius/2,
                radius/2
            );
            shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = shineGradient;
            this.ctx.fill();
            
            // Add metallic border
            this.ctx.strokeStyle = this.colors.border;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw text (existing text drawing code)
            this.ctx.save();
            this.ctx.rotate(currentAngle + sliceSize / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = this.colors.text;
            
            if (this.options[i] === 'WIN VIP! 💎') {
                this.ctx.font = 'bold 12px Arial';
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeText(this.options[i], radius - 25, 4);
            } else {
                this.ctx.font = 'bold 10px Arial';
            }
            
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            this.ctx.fillText(this.options[i], radius - 25, 4);
            this.ctx.restore();

            currentAngle += sliceSize;
        }
        
        // Enhanced center circle with metallic effect
        const centerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        centerGradient.addColorStop(0, '#FFD700');
        centerGradient.addColorStop(0.5, '#FFF8DC');
        centerGradient.addColorStop(1, '#FFD700');
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fillStyle = centerGradient;
        this.ctx.fill();
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();

        // Enhanced pointer with metallic gradient
        const centerX = this.canvas.width / 2;
        this.ctx.globalAlpha = this.opacity;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 15, 10);
        this.ctx.lineTo(centerX + 15, 10);
        this.ctx.lineTo(centerX, 35);
        this.ctx.closePath();
        
        const pointerGradient = this.ctx.createLinearGradient(centerX - 15, 0, centerX + 15, 35);
        pointerGradient.addColorStop(0, '#FF6B6B');
        pointerGradient.addColorStop(0.5, '#FF4500');
        pointerGradient.addColorStop(1, '#8B0000');
        
        this.ctx.fillStyle = pointerGradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#8B0000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    // Helper function to darken colors
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16),
              amt = Math.round(2.55 * percent),
              R = (num >> 16) - amt,
              G = (num >> 8 & 0x00FF) - amt,
              B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
    }

    // Add method to calculate which segment is currently at the top
    getCurrentSegment() {
        const normalizedAngle = this.startAngle % (2 * Math.PI);
        let currentAngle = 0;
        const regularSlice = 2 * Math.PI / 5.5;
        const smallSlice = regularSlice / 2;

        for (let i = 0; i < this.options.length; i++) {
            const sliceSize = this.options[i] === 'WIN VIP! 💎' ? smallSlice : regularSlice;
            if (normalizedAngle >= currentAngle && normalizedAngle < currentAngle + sliceSize) {
                return this.options[i];
            }
            currentAngle += sliceSize;
        }
        return this.options[0];
    }

    startSpinAway() {
        this.isSpinning = true;
        const spinDuration = 30000; // Spin for 30 seconds
        const startTime = performance.now(); // Record the start time
        const initialSpeed = 0.2; // Initial spin speed
        let currentSpeed = initialSpeed;

        const spinAway = (currentTime) => {
            const elapsedTime = currentTime - startTime;

            // Continue spinning for the specified duration
            if (elapsedTime < spinDuration) {
                this.startAngle += currentSpeed; // Increase the angle
                this.drawWheel();

                // Adjust speed based on the remaining time
                const remainingTime = spinDuration - elapsedTime;
                currentSpeed = initialSpeed * (remainingTime / spinDuration); // Decrease speed as time goes on

                requestAnimationFrame(spinAway); // Keep spinning
            } else {
                // Gradually slow down the wheel after 30 seconds
                const stopSpin = () => {
                    if (currentSpeed > 0) {
                        this.startAngle += currentSpeed; // Continue to spin
                        currentSpeed -= 0.01; // Decrease speed gradually
                        this.drawWheel();
                        requestAnimationFrame(stopSpin); // Continue until speed is zero
                    } else {
                        this.isSpinning = false; // Stop spinning
                    }
                };
                stopSpin();
            }
        };
        requestAnimationFrame(spinAway);
    }
}

// Initialize the wheel when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchLatestVideos();
    fetchLatestClips();
    const wheel = new WheelOfFortune();
});

const xanonoImage = document.getElementById('xanonoImage');

// Function to switch images
let isXanono = true; // Track which image is currently displayed

function switchImage() {
    if (isXanono) {
        xanonoImage.src = 'xannystare.png'; // Change to hover image
    } else {
        xanonoImage.src = 'xanono.png'; // Change back to original image
    }
    isXanono = !isXanono; // Toggle the image state
}

// Set interval to switch images every 2 seconds (2000 milliseconds)
setInterval(switchImage, 2000); 
