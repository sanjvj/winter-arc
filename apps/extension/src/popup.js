/**
 * Winter Arc Chrome Extension - Popup Controller
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

const FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'city',
  'linkedin',
  'github',
  'portfolio',
  'degree',
  'college',
  'gradYear',
  'cgpa',
  'experienceYears',
  'noticePeriod',
  'expectedCTC',
  'currentCTC',
  'authorizedInIndia',
  'sponsorshipNeeded',
  'customWhyCompanyNote',
  'geminiApiKey',
];

function getFormProfile() {
  const profile = {};
  for (const field of FIELDS) {
    const el = document.getElementById(field);
    if (el) {
      profile[field] = el.value.trim();
    }
  }
  profile.fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || DEFAULT_PROFILE.fullName;
  profile.summary = DEFAULT_PROFILE.summary;
  return profile;
}

function populateForm(profile) {
  for (const field of FIELDS) {
    const el = document.getElementById(field);
    if (el && profile[field] !== undefined) {
      el.value = profile[field];
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const autofillBtn = document.getElementById('autofill-btn');
  const profileForm = document.getElementById('profile-form');
  const saveBtn = document.getElementById('save-btn');
  const statusText = document.getElementById('status-text');
  const statusDot = document.getElementById('status-dot');

  // 1. Load saved profile from storage
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['winterArcProfile'], (result) => {
      const saved = result.winterArcProfile || DEFAULT_PROFILE;
      populateForm(saved);
    });
  } else {
    populateForm(DEFAULT_PROFILE);
  }

  // 2. Autofill Action
  autofillBtn.addEventListener('click', async () => {
    const profile = getFormProfile();
    statusText.textContent = 'Scanning and filling fields...';
    statusDot.style.backgroundColor = '#F59E0B'; // Amber

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        statusText.textContent = 'No active tab found';
        statusDot.style.backgroundColor = '#EF4444';
        return;
      }

      // Check if restricted page (e.g. chrome:// or edge://)
      if (activeTab.url && (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('edge://') || activeTab.url.startsWith('about:'))) {
        statusText.textContent = 'Cannot run on internal browser pages';
        statusDot.style.backgroundColor = '#EF4444';
        return;
      }

      // Send autofill message to content script
      chrome.tabs.sendMessage(activeTab.id, { action: 'AUTOFILL', profile }, async (response) => {
        if (chrome.runtime.lastError || !response) {
          // Content script wasn't injected yet (page loaded before extension)
          // Inject content.js dynamically and re-try
          try {
            await chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              files: ['content.js'],
            });

            // Re-send message
            chrome.tabs.sendMessage(activeTab.id, { action: 'AUTOFILL', profile }, (res) => {
              if (res && res.success) {
                statusText.textContent = `✅ Autofilled ${res.count} field${res.count === 1 ? '' : 's'}!`;
                statusDot.style.backgroundColor = '#10B981';
              } else {
                statusText.textContent = 'No empty fields matched on this page';
                statusDot.style.backgroundColor = '#71717A';
              }
            });
          } catch (injectErr) {
            statusText.textContent = 'Please refresh the job page and retry';
            statusDot.style.backgroundColor = '#EF4444';
          }
        } else {
          statusText.textContent = `✅ Autofilled ${response.count} field${response.count === 1 ? '' : 's'}!`;
          statusDot.style.backgroundColor = '#10B981';
        }
      });
    } catch (err) {
      statusText.textContent = 'Error: ' + err.message;
      statusDot.style.backgroundColor = '#EF4444';
    }
  });

  // 3. Save Profile Action
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = getFormProfile();

    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ winterArcProfile: profile }, () => {
        saveBtn.textContent = '✓ Saved to Extension Storage!';
        saveBtn.style.backgroundColor = '#065F46'; // Forest green
        saveBtn.style.color = '#FFFFFF';
        setTimeout(() => {
          saveBtn.textContent = 'Save Profile Updates';
          saveBtn.style.backgroundColor = '#1E212D';
        }, 2000);
      });
    }
  });
});
