/**
 * Winter Arc Chrome Extension - Service Worker
 */

const DEFAULT_PROFILE = {
  fullName: 'Sanjay Surya',
  firstName: 'Sanjay',
  lastName: 'Surya',
  email: 'sanjaysurya3010@gmail.com',
  phone: '+91 9876543210',
  city: 'Bengaluru, India',
  linkedin: 'https://www.linkedin.com/in/sanjaysurya',
  github: 'https://github.com/sanjvj',
  portfolio: 'https://winter-arc-c2def.web.app',
  degree: 'B.Tech in Computer Science and Engineering',
  college: 'Anna University',
  gradYear: '2025',
  cgpa: '8.5',
  experienceYears: '0',
  noticePeriod: 'Immediate',
  expectedCTC: '12 LPA',
  currentCTC: 'Fresher',
  authorizedInIndia: 'Yes',
  sponsorshipNeeded: 'No',
  gender: 'Male',
  summary: 'Full-stack developer (2025 CS graduate) with strong foundations in Data Structures, Algorithms, TypeScript, React, Next.js, and Node.js. Excited to contribute to high-impact product engineering.',
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Winter Arc] Extension installed. Initializing storage...');
  chrome.storage.local.get(['winterArcProfile'], (result) => {
    if (!result.winterArcProfile) {
      chrome.storage.local.set({ winterArcProfile: DEFAULT_PROFILE });
    }
  });
});

// Keyboard shortcut listener (Alt+Shift+F)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'autofill-page') {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab || !tab.id) return;

    chrome.storage.local.get(['winterArcProfile'], async (res) => {
      const profile = res.winterArcProfile || DEFAULT_PROFILE;
      try {
        chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL', profile }, async (response) => {
          if (chrome.runtime.lastError || !response) {
            // Content script not ready; inject and retry
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js'],
            });
            chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL', profile });
          }
        });
      } catch (err) {
        console.warn('[Winter Arc] Background shortcut error:', err);
      }
    });
  }
});
