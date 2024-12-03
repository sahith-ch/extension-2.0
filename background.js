// Configuration
const CONFIG = {
  updateInterval: 1000, // ms between time updates
  minActiveWindow: 500, // ms minimum time to count as active
  maxHistoryDays: 30 // days to keep history
};

// State management
let tabStates = {};
let activeTabId = null;
let focusedWindowId = null;
let intervalId = null;

// Initialize tracking
chrome.runtime.onStartup.addListener(initializeTracking);
chrome.runtime.onInstalled.addListener(initializeTracking);

function initializeTracking() {
  cleanupOldData(); // Cleanup old data on startup
  initializeTabStates();
  startPeriodicUpdates();
}

async function initializeTabStates() {
  try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
          if (tab.url && isValidUrl(tab.url)) {
              tabStates[tab.id] = createTabState(tab.url);
          }
      });
  } catch (error) {
      console.error('Error initializing tab states:', error);
  }
}

function createTabState(url) {
  return {
      domain: getDomain(url) || 'unknown',
      startTime: null,
      isActive: false,
      lastUpdated: null
  };
}

function isValidUrl(url) {
  return url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
}

function getDomain(url) {
  try {
      const hostname = new URL(url).hostname;
      
      // Remove 'www.' prefix if present
      let cleanHostname = hostname.replace(/^www\./, '');
      
      // Split the hostname into parts
      const parts = cleanHostname.split('.');
      
      // If we have a country-specific domain (e.g., amazon.co.uk)
      if (parts.length > 2 && parts[parts.length - 2] === 'co') {
          return parts.slice(-3).join('.');
      }
      
      // For subdomains (e.g., mail.google.com), get the main domain
      if (parts.length > 2) {
          // Check for common two-part TLDs like .com.br, .com.au
          const commonTwoPartTLDs = ['com.br', 'com.au', 'co.uk', 'co.jp', 'co.in'];
          const lastTwoParts = parts.slice(-2).join('.');
          if (commonTwoPartTLDs.includes(lastTwoParts)) {
              return parts.slice(-3).join('.');
          }
          return parts.slice(-2).join('.');
      }
      
      return cleanHostname;
  } catch {
      return null;
  }
}

function getDateKey() {
  return new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

// Data structure management
async function cleanupOldData() {
  try {
      const data = await chrome.storage.local.get(null);
      const today = new Date();
      const deleteBefore = new Date(today);
      deleteBefore.setDate(today.getDate() - CONFIG.maxHistoryDays);
      
      const keysToDelete = Object.keys(data)
          .filter(key => key.startsWith('timeSpent_'))
          .filter(key => {
              const dateStr = key.split('_')[1];
              return new Date(dateStr) < deleteBefore;
          });
      
      if (keysToDelete.length > 0) {
          await chrome.storage.local.remove(keysToDelete);
      }
  } catch (error) {
      console.error('Error cleaning up old data:', error);
  }
}

//AI functions

let currentSession = null;

async function initializeAISession(stats,time) {
  
  
    try {
        const capabilities = await ai.languageModel.capabilities();
        
        if (capabilities.available === "no") {
          throw new Error("Language model is not available");
        }
    
        currentSession = await ai.languageModel.create({
          systemPrompt: "You’re a witty assistant analyzing screen time across websites and apps, providing concise and impactful insights with a friendly, light-hearted tone. You celebrate good habits and use humor to gently nudge users toward improvement when necessary. Your focus is on identifying patterns, trends, and actionable tips while keeping feedback constructive and relatable. Screen time ranges from minimal users, spending around 0.5 hours daily (14 hours monthly), to extreme users, clocking in at 6.5 hours daily (196 hours monthly). Low usage averages 1.4 hours daily (42 hours monthly), while average users spend 2.8 hours daily (84 hours monthly), and high usage is around 4.6 hours daily (140 hours monthly). Your goal is to encourage a balance between productivity and digital well-being, making users more mindful of their habits.",
          temperature: capabilities.defaultTemperature,
          topK: capabilities.defaultTopK,
          monitor(m) {
            m.addEventListener("downloadprogress", e => {
              console.log(`Model download progress: ${e.loaded}/${e.total} bytes`);
            });
          }
        });
        console.log(`Session initialized with ${currentSession.tokensLeft} tokens available`);
        console.log("The stats are"+stats);
        console.log(typeof(stats));
        const jsonObject = JSON.parse(stats);
        let updatedStats =convertTimeToReadableFormat(jsonObject);
        console.log("The data is for following timePeriod"+time);
        console.log(updatedStats);
        let AIText = JSON.stringify(updatedStats);
        
        const response = await currentSession.prompt(`Here’s my screen time data for ${time} across different websites and apps ${AIText}. Analyze it and give me concise yet meaningful insights. Highlight any overuse, underuse, or interesting patterns. If I’ve been a bit too much on any platform, feel free to roast me lightly but also give me practical suggestions to improve if screen time is more than what is considered low. If I’ve done well, don’t hold back on the praise. Keep the tone friendly and a bit playful!`)
        console.log("Hello");
        
        console.log("The response is"+response);
        
        console.log(`Session initialized with ${currentSession.tokensLeft} tokens available`);
        console.log("The end");
        
        
        return response;
      } catch (error) {
        console.error("Failed to initialize AI session:", error);
        return false;
      }
}
function convertTimeToReadableFormat(stats) {
  // Handle case where stats might be null or undefined
  if (!stats || typeof stats !== 'object') {
    return {};
  }

  const result = {};

  // Loop through the object entries safely
  for (const [site, timeMs] of Object.entries(stats)) {
    // Validate input
    if (timeMs == null || typeof timeMs !== 'number') {
      result[site] = "0 seconds";
      continue;
    }

    // Ensure we're working with a number
    const safeTimeMs = Number(timeMs);

    // Skip invalid numbers
    if (isNaN(safeTimeMs) || safeTimeMs < 0) {
      result[site] = "0 seconds";
      continue;
    }

    const timeInSeconds = safeTimeMs / 1000;

    if (timeInSeconds < 1) {
      result[site] = "0 seconds";
    } else if (timeInSeconds < 60) {
      result[site] = `${Math.round(timeInSeconds)} seconds`;
    } else if (timeInSeconds < 3600) {
      const timeInMinutes = timeInSeconds / 60;
      result[site] = `${timeInMinutes.toFixed(1)} minutes`;
    } else {
      const timeInHours = timeInSeconds / 3600;
      result[site] = `${timeInHours.toFixed(2)} hours`;
    }
  }

  return result;
}

// Storage management functions
async function getDayStats(date) {
  const data = await chrome.storage.local.get(`timeSpent_${date}`);
  return data[`timeSpent_${date}`] || {};
}

async function getWeekStats() {
  const weekData = {};
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayStats = await getDayStats(dateKey);
      
      // Merge day stats into week data
      Object.entries(dayStats).forEach(([domain, time]) => {
          weekData[domain] = (weekData[domain] || 0) + time;
      });
  }
  
  console.log(`This week's data: ${JSON.stringify(weekData, null, 2)}`);

  
  return weekData;
}

async function getMonthStats() {
  const monthData = {};
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayStats = await getDayStats(dateKey);
      
      // Merge day stats into month data
      Object.entries(dayStats).forEach(([domain, time]) => {
          monthData[domain] = (monthData[domain] || 0) + time;
      });
  }
  
  return monthData;
}

// Event listeners
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
      tabStates[tab.id] = {
          domain: getDomain(tab.url),
          startTime: null,
          isActive: false,
          lastUpdated: null
      };
  }
  console.log(tabStates);
  
});

 function CheckIfTabExists (keyToCheck){
    return keyToCheck in tabStates;
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const currentTime = Date.now();
  console.log("Switching from  "+activeTabId +"to"+activeInfo.tabId);
 
  
  
  try {
    console.log(CheckIfTabExists(activeTabId));
    
  if (CheckIfTabExists(activeTabId)) {
    if (activeTabId && tabStates[activeTabId]?.isActive) {
      await updateTimeSpent(activeTabId, currentTime - (tabStates[activeTabId].lastUpdated || currentTime));
      tabStates[activeTabId].isActive = false;
      tabStates[activeTabId].lastUpdated = null;
      }
  }
    
    
      
      
      activeTabId = activeInfo.tabId;
      
      // Fetch the tab details to ensure we have a valid URL
      const tab = await chrome.tabs.get(activeTabId);
      
      // Ensure we only track valid URLs
      if (!isValidUrl(tab.url)) {
          return;
      }
      
      // Initialize tab state if it doesn't exist
      if (!tabStates[activeTabId]) {
          tabStates[activeTabId] = createTabState(tab.url);
      }
      
      // Update tab state
      tabStates[activeTabId].isActive = true;
      tabStates[activeTabId].startTime = currentTime;
      tabStates[activeTabId].lastUpdated = currentTime;
      
  } catch (error) {
      console.error('Error in onActivated listener:', error);
  }
});
chrome.windows.onFocusChanged.addListener((windowId) => {
  const currentTime = new Date().getTime();
  
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
      if (activeTabId && tabStates[activeTabId]?.isActive) {
          updateTimeSpent(activeTabId, currentTime - (tabStates[activeTabId].lastUpdated || currentTime));
          tabStates[activeTabId].isActive = false;
          tabStates[activeTabId].lastUpdated = null;
      }
      focusedWindowId = null;
  } else {
      focusedWindowId = windowId;
      chrome.tabs.query({ active: true, windowId }, async (tabs) => {
          if (tabs[0]) {
              if (activeTabId && tabStates[activeTabId]?.isActive) {
                console.log("is active1",   tabStates[activeTabId].isActive)  
                await updateTimeSpent(activeTabId, currentTime - (tabStates[activeTabId].lastUpdated || currentTime));
                console.log("is active2",   tabStates[activeTabId].isActive)  

                tabStates[activeTabId].isActive = false;
                  tabStates[activeTabId].lastUpdated = null;
              }
              
              activeTabId = tabs[0].id;
              if (tabStates[activeTabId]) {
                  tabStates[activeTabId].isActive = true;
                  tabStates[activeTabId].startTime = currentTime;
                  tabStates[activeTabId].lastUpdated = currentTime;
              }
          }
      });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
      const currentTime = new Date().getTime();
      const newDomain = getDomain(changeInfo.url);
      
      if (tabId === activeTabId && tabStates[tabId]?.isActive) {
          await updateTimeSpent(tabId, currentTime - (tabStates[tabId].lastUpdated || currentTime));
      }
      
      tabStates[tabId] = {
          domain: newDomain,
          startTime: tabId === activeTabId ? currentTime : null,
          isActive: tabId === activeTabId,
          lastUpdated: tabId === activeTabId ? currentTime : null
      };
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log("Removing "+tabId);
  console.log(tabId === activeTabId);
  

  
  // if (tabStates[tabId]?.isActive) {
  //     const currentTime = new Date().getTime();
  //     await updateTimeSpent(tabId, currentTime - (tabStates[tabId].lastUpdated || currentTime));
  // }
 
  delete tabStates[tabId];
  console.log("Completely removed"+tabId);
  
});

// Time tracking functions
function startPeriodicUpdates() {
  if (intervalId) {
      clearInterval(intervalId);
  }
  
  intervalId = setInterval(async () => {
      if (!activeTabId || !focusedWindowId) return;
      
      const currentTime = new Date().getTime();
      const activeState = tabStates[activeTabId];

      if (activeState?.isActive && activeState.lastUpdated && 
          (currentTime - activeState.lastUpdated) >= CONFIG.minActiveWindow) {
          await updateTimeSpent(activeTabId, currentTime - activeState.lastUpdated);
          activeState.lastUpdated = currentTime;
      }
      
  }, CONFIG.updateInterval);
}

async function updateTimeSpent(tabId, duration) {
  console.log("duration 2",duration);

  if (duration < CONFIG.minActiveWindow) return;
  
  try {
      const tabState = tabStates[tabId];
      if (!tabState?.domain) return;
      
      const dateKey = getDateKey();
      const storageKey = `timeSpent_${dateKey}`;
      
      // Get existing data for today
      const data = await chrome.storage.local.get(storageKey);
      const timeSpentToday = data[storageKey] || {};
      
      // Update time for domain
      if (!timeSpentToday[tabState.domain]) {
          timeSpentToday[tabState.domain] = 0;
      }
      timeSpentToday[tabState.domain] += duration;
      console.log("duration 3",timeSpentToday[tabState.domain]);

      // Store updated data
      await chrome.storage.local.set({ 
          [storageKey]: timeSpentToday,
          timeSpent: timeSpentToday // Keep this for backward compatibility
      });
  
  
  } catch (error) {
      console.error('Error updating time spent:', error);
  }
}

// Extension lifecycle handlers
chrome.runtime.onSuspend.addListener(() => {
  if (intervalId) {
      clearInterval(intervalId);
  }
  
  if (activeTabId && tabStates[activeTabId]?.isActive) {
      const currentTime = Date.now();
      updateTimeSpent(activeTabId, currentTime - (tabStates[activeTabId].lastUpdated || currentTime));
  }
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  const currentTime = new Date().getTime();
  if (activeTabId && tabStates[activeTabId]) {
      tabStates[activeTabId].startTime = currentTime;
      tabStates[activeTabId].lastUpdated = currentTime;
      tabStates[activeTabId].isActive = true;
  }
  startPeriodicUpdates();
});

// Message handlers for popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getStats') {
      (async () => {
        try {
          let stats;
          switch (request.timeframe) {
            case 'today':
              stats = await getDayStats(getDateKey());
              break;
            case 'week':
              stats = await getWeekStats();
              break;
            case 'month':
              stats = await getMonthStats();
              break;
            default:
              stats = await getDayStats(getDateKey());
          }
          sendResponse({ success: true, data: stats });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // Required for async response
    }
    else if(request.type === 'ai'){
      (async() =>{
        try {
          console.log("The stats I am getting: ", request.statistics);
          const cleanedStats = JSON.stringify(request.statistics, null, 2)
          let result = await initializeAISession(cleanedStats,request.time);
          sendResponse({success: true, data: result});
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
  }
  });