document.addEventListener('DOMContentLoaded', async () => {
    const statsDiv = document.getElementById('stats');
    const totalTimeSpan = document.getElementById('totalTime');
    const refreshBtn = document.getElementById('refreshBtn');
    const timeframeSelect = document.getElementById('timeframe');
    const askAiBtn = document.getElementById('askAi');
    const aiResponseDiv = document.getElementById('aiResponse');
    let TheData = "";
    let time = 'today';
    
    const siteIcons = {
        // Social Media
        'youtube.com': '<i class="fab fa-youtube" style="color: #FF0000;"></i>',
        'facebook.com': '<i class="fab fa-facebook" style="color: #3B5998;"></i>',
        'twitter.com': '<i class="fab fa-twitter" style="color: #1DA1F2;"></i>',
        'instagram.com': '<i class="fab fa-instagram" style="color: #E1306C;"></i>',
        'linkedin.com': '<i class="fab fa-linkedin" style="color: #0077B5;"></i>',
        'tiktok.com': '<i class="fab fa-tiktok" style="color: #000000;"></i>',
        'reddit.com': '<i class="fab fa-reddit" style="color: #FF4500;"></i>',
        'snapchat.com': '<i class="fab fa-snapchat-ghost" style="color: #FFFC00;"></i>',
        'twitch.tv': '<i class="fab fa-twitch" style="color: #9146FF;"></i>',
        'vimeo.com': '<i class="fab fa-vimeo" style="color: #1AB7EA;"></i>',
    
        // Messaging & Communication
        'whatsapp.com': '<i class="fab fa-whatsapp" style="color: #25D366;"></i>',
        'telegram.org': '<i class="fab fa-telegram" style="color: #0088CC;"></i>',
        'discord.com': '<i class="fab fa-discord" style="color: #5865F2;"></i>',
        'signal.org': '<i class="fas fa-comment" style="color: #3A76F0;"></i>',
        'skype.com': '<i class="fab fa-skype" style="color: #00AFF0;"></i>',
        'zoom.us': '<i class="fas fa-video" style="color: #2D8CFF;"></i>',
    
        // Tech & Development
        'github.com': '<i class="fab fa-github" style="color: #333;"></i>',
        'stackoverflow.com': '<i class="fab fa-stack-overflow" style="color: #F48024;"></i>',
        'gitlab.com': '<i class="fab fa-gitlab" style="color: #FC6D26;"></i>',
        'bitbucket.org': '<i class="fab fa-bitbucket" style="color: #0052CC;"></i>',
        'codepen.io': '<i class="fab fa-codepen" style="color: #000000;"></i>',
        'heroku.com': '<i class="fas fa-cloud" style="color: #6762A6;"></i>',
    
        // Search & Platforms
        'google.com': '<i class="fab fa-google" style="color: #4285F4;"></i>',
        'wikipedia.org': '<i class="fab fa-wikipedia-w" style="color: #000000;"></i>',
        'amazon.com': '<i class="fab fa-amazon" style="color: #FF9900;"></i>',
        'chatgpt.com': '<i class="fas fa-robot" style="color: #10A37F;"></i>',
        'claude.ai': '<i class="fas fa-robot" style="color: #10A37F;"></i>',
        'bing.com': '<i class="fas fa-search" style="color: #FFB900;"></i>',
    
        // Streaming & Entertainment
        'netflix.com': '<i class="fab fa-netflix" style="color: #E50914;"></i>',
        'spotify.com': '<i class="fab fa-spotify" style="color: #1DB954;"></i>',
        'hulu.com': '<i class="fas fa-tv" style="color: #3DBB3D;"></i>',
        'disneyplus.com': '<i class="fas fa-magic" style="color: #113CCF;"></i>',
        'hbo.com': '<i class="fas fa-film" style="color: #000000;"></i>',
    
        // News & Media
        'cnn.com': '<i class="fas fa-newspaper" style="color: #CC0000;"></i>',
        'bbc.com': '<i class="fas fa-broadcast-tower" style="color: #000000;"></i>',
        'reuters.com': '<i class="fas fa-globe" style="color: #FF8000;"></i>',
        'npr.org': '<i class="fas fa-microphone" style="color: #3F7F3F;"></i>',
        'medium.com': '<i class="fab fa-medium" style="color: #000000;"></i>',
    
        // E-commerce & Marketplaces
        'ebay.com': '<i class="fab fa-ebay" style="color: #0064D2;"></i>',
        'etsy.com': '<i class="fas fa-shopping-cart" style="color: #F45800;"></i>',
        'aliexpress.com': '<i class="fas fa-shopping-bag" style="color: #FF6000;"></i>',
        'shopify.com': '<i class="fas fa-store" style="color: #7AB55C;"></i>',
        'walmart.com': '<i class="fas fa-shopping-basket" style="color: #0071DC;"></i>',
    
        // Professional & Business
        'slack.com': '<i class="fab fa-slack" style="color: #4A154B;"></i>',
        'dropbox.com': '<i class="fab fa-dropbox" style="color: #0061FF;"></i>',
        'microsoft.com': '<i class="fab fa-microsoft" style="color: #737373;"></i>',
        'salesforce.com': '<i class="fas fa-cloud" style="color: #1798C1;"></i>',
        'asana.com': '<i class="fas fa-tasks" style="color: #273862;"></i>',
    
        // Travel & Services
        'airbnb.com': '<i class="fab fa-airbnb" style="color: #FF5A5F;"></i>',
        'booking.com': '<i class="fas fa-hotel" style="color: #0071C2;"></i>',
        'tripadvisor.com': '<i class="fas fa-plane" style="color: #00AF87;"></i>',
        'uber.com': '<i class="fab fa-uber" style="color: #000000;"></i>',
        'lyft.com': '<i class="fas fa-car" style="color: #FF00BF;"></i>',
    
        // Finance
        'paypal.com': '<i class="fab fa-paypal" style="color: #00457C;"></i>',
        'stripe.com': '<i class="fas fa-credit-card" style="color: #6772E5;"></i>',
        'venmo.com': '<i class="fas fa-hand-holding-usd" style="color: #3D95CE;"></i>',
        'robinhood.com': '<i class="fas fa-chart-line" style="color: #00C805;"></i>',
        'coinbase.com': '<i class="fab fa-bitcoin" style="color: #0052FF;"></i>',
    
        // Educational
        'coursera.org': '<i class="fas fa-graduation-cap" style="color: #2A73CC;"></i>',
        'udemy.com': '<i class="fas fa-chalkboard-teacher" style="color: #EC5252;"></i>',
        'edx.org': '<i class="fas fa-university" style="color: #2D83BF;"></i>',
        'khan.org': '<i class="fas fa-book-reader" style="color: #14BF96;"></i>',
    
        // Food & Delivery
        'grubhub.com': '<i class="fas fa-utensils" style="color: #F63440;"></i>',
        'doordash.com': '<i class="fas fa-pizza-slice" style="color: #FF3008;"></i>',
        'ubereats.com': '<i class="fas fa-hamburger" style="color: #000000;"></i>',
        'postmates.com': '<i class="fas fa-shipping-fast" style="color: #2196F3;"></i>',
        'swiggy.com' : '<i class="fas fa-hamburger" style="color: #000000;"></i>',
        'zomato.com' : '<i class="fas fa-pizza-slice" style="color: #FF3008;"></i>',
    
        // Others
        'quora.com': '<i class="fab fa-quora" style="color: #A82400;"></i>',
        'pinterest.com': '<i class="fab fa-pinterest" style="color: #E60023;"></i>',
        'tumblr.com': '<i class="fab fa-tumblr" style="color: #36465D;"></i>',
        'yelp.com': '<i class="fab fa-yelp" style="color: #D32323;"></i>',
    
        // New Tab Icons
        'newtab': '<i class="fas fa-plus" style="color: #666666;"></i>',
        'new-tab': '<i class="fas fa-plus-circle" style="color: #4A4A4A;"></i>',
        'blank': '<i class="fas fa-window-restore" style="color: #555555;"></i>'
    };

    async function getWeekStats() {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'getStats', timeframe: 'week' }, 
            (response) => {
              if (response && response.success) {            
                resolve(response.data);
              } else {
                reject(new Error(response?.error || 'Failed to fetch week stats'));
              }
            }
          );
        });
      }


    
    async function getMonthStats() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { type: 'getStats', timeframe: 'month' }, 
                (response) => {
                    if (response && response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.error || 'Failed to fetch month stats'));
                    }
                }
            );
        });
    }

    async function askAI(stats) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              {type: "ai", statistics: stats ,time:time},
              (response) => {
                console.log('Stats:', stats);
                
                if (response && response.success) {
                    console.log('AI Response:', response.data);                 
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'Failed to fetch from AI'));
                }
              }
            );
        });
    }

    
  async function updateStats() {
    statsDiv.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const selectedTimeframe = timeframeSelect.value;
        
        let timeSpentData;
        if (selectedTimeframe === 'today') {
            const data = await chrome.storage.local.get('timeSpent');
            timeSpentData = data.timeSpent || {};
            time='today'
            TheData = timeSpentData
        } else if (selectedTimeframe === 'week') {
            timeSpentData = await getWeekStats();
            time='week'
            TheData = timeSpentData;
        } else if (selectedTimeframe === 'month') {
            timeSpentData = await getMonthStats();
            time='month'
            TheData = timeSpentData;
        }
        
        // Calculate total time
        const totalMs = Object.values(timeSpentData).reduce((a, b) => a + b, 0);
        totalTimeSpan.textContent = formatTime(totalMs);
        
        // Sort sites by time spent
        const sortedSites = Object.entries(timeSpentData)
            .filter(([, time]) => time > 0) // Filter out sites with no time
            .sort(([, a], [, b]) => b - a);
        
        statsDiv.innerHTML = ''; // Clear loading message
        
        if (sortedSites.length === 0) {
            statsDiv.innerHTML = '<div class="no-data">No tracking data yet</div>';
            return;
        }
        
        // Calculate percentage for progress bars
        const maxTime = sortedSites[0][1]; // Time of most visited site
        
        sortedSites.forEach(([domain, time]) => {
            const percentage = (time / maxTime * 100).toFixed(1);
            const siteDiv = document.createElement('div');
            siteDiv.className = 'site-entry';
            siteDiv.innerHTML = `
                ${siteIcons[domain] || '<i class="fas fa-globe"></i>'}
                <div class="site-info">
                    <div class="domain">${formatDomain(domain)}</div>
                    <div class="time">${formatTime(time)}</div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
            statsDiv.appendChild(siteDiv);
        });
    } catch (error) {
        statsDiv.innerHTML = '<div class="error">Error loading statistics</div>';
        console.error('Error:', error);
    }
}
    
    // Format time from milliseconds to readable string
    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `<1m`;
        }
    }
    
    // Format domain name
    function formatDomain(domain) {
        // Remove www. prefix if present
        domain = domain.replace(/^www\./, '');
        // Truncate if too long
        return domain.length > 25 ? domain.substring(0, 22) + '...' : domain;
    }
    
    // Event Listeners
    refreshBtn.addEventListener('click', updateStats);
    timeframeSelect.addEventListener('change', updateStats);
   // Replace the AI response handling in the askAiBtn event listener with this:
   askAiBtn.addEventListener('click', () => {
    if (!TheData || Object.keys(TheData).length === 0) {
        aiResponseDiv.innerHTML = 'No data available for AI insights.';
        return;
    }
    
    // Disable the button and show loading animation
    askAiBtn.disabled = true;
    askAiBtn.classList.add('loading');
   aiResponseDiv.innerHTML = `
        <div class="ai-loading">
            <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
            <p>Generating AI insights...</p>
        </div>
    `;
    
    askAI(TheData)
        .then(response => {
            // Format the response with nice styling
            const formattedResponse = formatAIInsights(response);
            aiResponseDiv.innerHTML = formattedResponse;
        })
        .catch(error => {
            aiResponseDiv.innerHTML = `<p style="color: red;">❌ ${error.message}</p>`;
            console.error('AI Request Error:', error);
        })
        .finally(() => {
            // Re-enable the button and remove loading state
            askAiBtn.disabled = false;
            askAiBtn.classList.remove('loading');
        });
});


// New function to format AI insights
function formatAIInsights(text) {
    // Separate key insights
    const insights = text.split('\n').filter(line => line.trim() !== '');
    
    // Generate formatted HTML
    const formattedInsights = insights.map(insight => {
        // Bold key points
        insight = insight.replace(/^(.*?:)/g, '<strong>$1</strong>');
        
        // Italicize percentages and numbers
        insight = insight.replace(/(\d+\.?\d*%?)/g, '<em>$1</em>');
        
        // Add bullet point styling
        return `<li>${insight}</li>`;
    }).join('');

    return `
        <div class="ai-insights">
            <h3 style="color: #4a54f0; margin-bottom: 10px;">🤖 AI Insights</h3>
            <ul style="list-style-type: none; padding: 0;">
                ${formattedInsights}
            </ul>
        </div>
    `;
}
    // Initial load
    updateStats();
});