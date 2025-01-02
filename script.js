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

// Update the DOMContentLoaded event listener to fetch both videos and clips
document.addEventListener('DOMContentLoaded', () => {
    fetchLatestVideos();
    fetchLatestClips();
}); 