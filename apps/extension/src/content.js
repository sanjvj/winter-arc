/**
 * Winter Arc Chrome Extension - Omni-Form Autofill Content Script
 * Supports: LinkedIn Easy Apply, Wellfound, Greenhouse, Lever, Ashby, Workday,
 * SmartRecruiters, BambooHR, and any company career portal.
 *
 * Features:
 * 1. Adaptive Real-Time Form Learning: Automatically detects and memorizes novel fields (e.g. Age, Pincode)
 * 2. Learned Field Bank: Auto-fills memorized custom fields on future job applications
 * 3. Smart Contextual Note Synthesis for Wellfound: "What interests you about working for this company?"
 * 4. Optional Live Gemini 1.5 Flash AI generation for tailored cover notes
 * 5. Safety Constraint: NEVER auto-submits any application.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__WINTER_ARC_AUTOFILL_LOADED__) return;
  window.__WINTER_ARC_AUTOFILL_LOADED__ = true;

  console.log('[Winter Arc Extension] Content script active on:', window.location.href);

  // Default Fallback Profile (Sanjay Surya)
  const DEFAULT_PROFILE = {
    fullName: 'Sanjay Surya',
    firstName: 'Sanjay',
    lastName: 'Surya',
    email: 'sanjaysurya3010@gmail.com',
    phone: '+91 9876543210',
    city: 'Bengaluru, India',
    currentLocation: 'Bengaluru, Karnataka, India',
    linkedin: 'https://www.linkedin.com/in/sanjaysurya',
    github: 'https://github.com/sanjvj',
    portfolio: 'https://winter-arc-c2def.web.app',
    degree: 'B.Tech in Computer Science and Engineering',
    college: 'Anna University',
    gradYear: '2025',
    cgpa: '8.5',
    experienceYears: '0',
    currentRole: 'Software Engineering Intern',
    currentCompany: 'Winter Arc',
    noticePeriod: 'Immediate (0 days)',
    expectedCTC: '12 LPA',
    currentCTC: 'Fresher',
    authorizedInIndia: 'Yes',
    sponsorshipNeeded: 'No',
    gender: 'Male',
    summary: 'Full-stack developer (2025 CS graduate) with strong foundations in Data Structures, Algorithms, TypeScript, React, Next.js, and Node.js. Excited to contribute to high-impact product engineering.',
    geminiApiKey: '',
  };

  const STANDARD_PATTERNS = [
    /\b(first[_\s-]?name|given[_\s-]?name|fname)\b/i,
    /\b(last[_\s-]?name|family[_\s-]?name|surname|lname)\b/i,
    /\b(full[_\s-]?name|legal\s+name|^name$)\b/i,
    /\b(email|e-mail)\b/i,
    /\b(phone|mobile|contact[_\s-]?number|tel|cell)\b/i,
    /linkedin/i,
    /github/i,
    /\b(portfolio|website|personal[_\s-]?url)\b/i,
    /\b(city|residence)\b/i,
    /\b(degree|major|qualification)\b/i,
    /\b(university|college|school)\b/i,
    /\b(graduat(ion|e)[_\s-]?year|passing[_\s-]?year)\b/i,
    /\b(cgpa|gpa|percentage)\b/i,
    /\b(notice\s*period)\b/i,
    /\b(expected\s*ctc|expected\s*salary)\b/i,
    /\b(current\s*ctc|current\s*salary)\b/i,
  ];

  function isStandardField(ctx) {
    return STANDARD_PATTERNS.some((pat) => pat.test(ctx));
  }

  function extractSemanticLabel(el) {
    // 1. Explicit label (for="id")
    if (el.id) {
      try {
        const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (lbl && lbl.textContent && lbl.textContent.trim().length > 1) {
          return lbl.textContent.trim();
        }
      } catch (e) {}
    }
    // 2. Parent label
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent) {
      const text = parentLabel.textContent.replace(el.value || '', '').trim();
      if (text.length > 1 && text.length < 80) return text;
    }
    // 3. aria-label
    if (el.getAttribute('aria-label')) {
      return el.getAttribute('aria-label').trim();
    }
    // 4. placeholder
    if (el.placeholder && el.placeholder.trim().length > 1) {
      return el.placeholder.trim();
    }
    // 5. Preceding text/label
    const prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'P')) {
      const t = prev.textContent.trim();
      if (t.length > 1 && t.length < 80) return t;
    }
    // 6. Name or ID fallback
    const raw = el.name || el.id || '';
    if (raw) {
      return raw.replace(/[_-]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
    }
    return '';
  }

  function normalizeKey(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
  }

  /**
   * Real-time Adaptive Form Learning
   * Listens to user inputs and memorizes novel fields in chrome.storage.local
   */
  function setupAdaptiveLearning() {
    document.addEventListener(
      'change',
      (e) => {
        const el = e.target;
        if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT')) return;
        if (el.type === 'password' || el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return;

        const val = (el.value || '').trim();
        if (!val || val.length === 0 || val.length > 500) return;

        const ctx = getFieldContext(el);
        // Skip built-in standard fields
        if (isStandardField(ctx)) return;

        const rawLabel = extractSemanticLabel(el);
        if (!rawLabel || rawLabel.length < 2) return;

        const key = normalizeKey(rawLabel);
        if (!key || key.length < 2) return;

        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['winterArcLearnedFields'], (result) => {
            const learned = result.winterArcLearnedFields || {};
            const cleanLabel = rawLabel.replace(/[*:]/g, '').trim();

            if (learned[key]?.value !== val) {
              learned[key] = {
                key,
                label: cleanLabel,
                value: val,
                updatedAt: new Date().toISOString(),
              };

              chrome.storage.local.set({ winterArcLearnedFields: learned }, () => {
                console.log(`[Winter Arc Adaptive] Learned new field: "${cleanLabel}" = "${val}"`);
                showLearnedToast(cleanLabel, val);
              });
            }
          });
        }
      },
      true,
    );
  }

  function showLearnedToast(label, value) {
    const existing = document.getElementById('winter-arc-learned-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'winter-arc-learned-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '85px';
    toast.style.right = '24px';
    toast.style.zIndex = '9999999';
    toast.style.backgroundColor = '#12141C';
    toast.style.color = '#FFFFFF';
    toast.style.border = '1px solid #10B981';
    toast.style.borderRadius = '10px';
    toast.style.padding = '10px 14px';
    toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    toast.style.fontSize = '12px';
    toast.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    toast.innerHTML = `
      <span style="color:#10B981;font-size:14px;">✨</span>
      <div>
        <span style="color:#A1A1AA;">Winter Arc learned:</span>
        <strong style="color:#FFFFFF;">${label.slice(0, 25)}</strong> = <span style="color:#7DD3FC;">"${value.slice(0, 20)}"</span>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * Detects Company and Role from active page DOM / title.
   */
  function detectCompanyAndRole() {
    let company = '';
    let role = '';

    // 1. Wellfound specific selectors
    const wfCompany = document.querySelector('a[href*="/company/"], [data-test="JobPostingCompany"], .company-name');
    if (wfCompany && wfCompany.textContent) {
      company = wfCompany.textContent.trim();
    }

    // 2. Parse document title
    const docTitle = document.title || '';
    if (!company) {
      const atMatch = docTitle.match(/(?:at|@)\s+([^-|–—]+)/i) || docTitle.match(/^([^-|–—]+)\s*[-|–—]/);
      if (atMatch && atMatch[1]) {
        company = atMatch[1].trim();
      }
    }

    // 3. Fallback to h1/h2 headings
    if (!company) {
      const heading = document.querySelector('h1, h2');
      if (heading && heading.textContent) {
        const text = heading.textContent.trim();
        const m = text.match(/(?:at|@)\s+([A-Za-z0-9\s&]+)/i);
        if (m && m[1]) company = m[1].trim();
      }
    }

    // Clean company name
    company = company.replace(/^(jobs at|careers at|working at|join)\s+/i, '').trim();
    if (company.toLowerCase().includes('wellfound')) company = '';

    // Detect role
    const roleMatch = docTitle.match(/^([^–—\-|@]+)/);
    if (roleMatch && roleMatch[1] && !roleMatch[1].toLowerCase().includes('wellfound') && !roleMatch[1].toLowerCase().includes('job')) {
      role = roleMatch[1].trim();
    }
    if (!role) {
      const h1 = document.querySelector('h1');
      if (h1 && h1.textContent && !h1.textContent.toLowerCase().includes('apply')) {
        role = h1.textContent.trim();
      }
    }

    return {
      company: company || 'your team',
      role: role || 'Software Engineer',
    };
  }

  /**
   * Extracts text snippet from job description on page.
   */
  function getJobSnippet() {
    const container = document.querySelector('[data-test="JobDescription"], .job-description, article, main, .content');
    if (container && container.textContent) {
      return container.textContent.replace(/\s+/g, ' ').trim().slice(0, 800);
    }
    return document.body.textContent.replace(/\s+/g, ' ').trim().slice(0, 800);
  }

  /**
   * Smart Contextual Note Synthesis for "Why this company?"
   */
  function generateTailoredCompanyNote(company, role, p) {
    if (p.customWhyCompanyNote && p.customWhyCompanyNote.trim().length > 10) {
      return p.customWhyCompanyNote
        .replace(/\{company\}/gi, company)
        .replace(/\{role\}/gi, role)
        .replace(/\{name\}/gi, p.fullName || 'Sanjay');
    }

    const comp = company && company !== 'your team' ? company : 'your team';
    const targetRole = role || 'Software Engineer';

    return `I am very excited about what ${comp} is building and would love to contribute directly as a ${targetRole}. As a 2025 Computer Science graduate with strong foundations in TypeScript, React, Next.js, and backend services, I focus on shipping high-performance web applications and solving complex algorithmic challenges. I ramp up quickly, take end-to-end ownership of features, and thrive in fast-paced product engineering. I would welcome the opportunity to discuss how my technical skills and enthusiasm can support ${comp}'s product goals. Thank you!`;
  }

  /**
   * Live Gemini 1.5 Flash AI generation for tailored recruiter notes.
   */
  async function generateWithGemini(apiKey, company, role, snippet, p) {
    try {
      const prompt = `You are a professional software engineer candidate applying for a job on Wellfound / careers portal.
Write a personalized, compelling, concise "Note to Recruiter" / "What interests you about working for this company?" response (3 to 4 sentences).
Target Company: ${company}
Target Role: ${role}
Job/Company Snippet from Page: ${snippet}
Candidate Info: ${p.fullName || 'Sanjay Surya'}, 2025 Computer Science graduate. Core skills: TypeScript, React, Next.js, Node.js, PostgreSQL, System Design, DSA. High velocity, fast learner.
Guidelines:
1. Reference the company name and what they build specifically based on the snippet.
2. Connect candidate's technical skills (React/Next.js/TypeScript/Node) to the company's needs.
3. Be professional, authentic, confident, and direct.
4. Do NOT use placeholders, brackets, or generic buzzwords. Output only the message body.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 20) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn('[Winter Arc] Gemini AI live generation failed, falling back to smart template:', err);
    }
    return null;
  }

  /**
   * Sets value on an input/textarea and triggers React / Vue / Angular synthetic events.
   */
  function setNativeValue(element, value) {
    if (!element || value === undefined || value === null) return false;

    try {
      element.focus();
      const proto = Object.getPrototypeOf(element);
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      const setter = desc?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

      if (setter) {
        setter.call(element, value);
      } else {
        element.value = value;
      }

      element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

      // Visual highlight
      element.style.outline = '2px solid #10B981';
      element.style.transition = 'outline 0.3s ease';
      setTimeout(() => {
        element.style.outline = '';
      }, 4000);

      return true;
    } catch (e) {
      console.warn('[Winter Arc] Failed to set native value:', e);
      return false;
    }
  }

  /**
   * Sets select dropdown to option matching text or value.
   */
  function setSelectValue(select, targetTextOrVal) {
    if (!select || !targetTextOrVal) return false;
    const target = targetTextOrVal.toLowerCase().trim();
    let foundIndex = -1;

    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      const optText = opt.text.toLowerCase().trim();
      const optVal = opt.value.toLowerCase().trim();
      if (optText === target || optVal === target || optText.includes(target)) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      select.selectedIndex = foundIndex;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.style.outline = '2px solid #10B981';
      setTimeout(() => { select.style.outline = ''; }, 4000);
      return true;
    }
    return false;
  }

  /**
   * Selects radio button matching Yes/No or target label.
   */
  function setRadioValue(radio, shouldSelect) {
    if (!radio) return false;
    if (shouldSelect && !radio.checked) {
      radio.click();
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  /**
   * Extracts all contextual text signals surrounding an element.
   */
  function getFieldContext(el) {
    const signals = [];

    // 1. Attributes
    if (el.name) signals.push(el.name);
    if (el.id) signals.push(el.id);
    if (el.placeholder) signals.push(el.placeholder);
    if (el.getAttribute('aria-label')) signals.push(el.getAttribute('aria-label'));
    if (el.getAttribute('data-testid')) signals.push(el.getAttribute('data-testid'));
    if (el.getAttribute('autocomplete')) signals.push(el.getAttribute('autocomplete'));

    // 2. Explicit label tag (for="id")
    if (el.id) {
      try {
        const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (labelEl) signals.push(labelEl.textContent || '');
      } catch (e) {}
    }

    // 3. Parent label or container
    const parentLabel = el.closest('label');
    if (parentLabel) signals.push(parentLabel.textContent || '');

    // 4. Preceding sibling or nearby header / label element
    const prev = el.previousElementSibling;
    if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'P')) {
      signals.push(prev.textContent || '');
    }

    // 5. Ancestor container text (first 100 chars, e.g. question header)
    const container = el.closest('.fb-dash-form-element, .jobs-easy-apply-form-section__grouping, .form-group, .field, div[data-test]');
    if (container) {
      const header = container.querySelector('label, h3, h4, span, legend');
      if (header) signals.push(header.textContent || '');
    }

    return signals.join(' ').toLowerCase();
  }

  /**
   * Main Autofill Engine
   */
  async function runAutofill(profileData) {
    const p = { ...DEFAULT_PROFILE, ...profileData };
    let filledCount = 0;

    // Load learned fields from chrome storage
    const learnedFields = await new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['winterArcLearnedFields'], (res) => {
          resolve(res.winterArcLearnedFields || {});
        });
      } else {
        resolve({});
      }
    });

    // Collect all fillable form elements in the document and open dialogs/modals
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select'));

    for (const el of inputs) {
      // Skip if already filled with non-empty user text (unless it's empty)
      if (el.tagName !== 'SELECT' && el.type !== 'radio' && el.type !== 'checkbox' && el.value && el.value.trim().length > 0) {
        continue;
      }

      const ctx = getFieldContext(el);

      // --- FIRST NAME ---
      if (
        /\b(first[_\s-]?name|given[_\s-]?name|fname)\b/i.test(ctx) &&
        !/\b(last|middle|full|sur)\b/i.test(ctx)
      ) {
        if (setNativeValue(el, p.firstName)) filledCount++;
        continue;
      }

      // --- LAST NAME ---
      if (/\b(last[_\s-]?name|family[_\s-]?name|surname|lname)\b/i.test(ctx)) {
        if (setNativeValue(el, p.lastName)) filledCount++;
        continue;
      }

      // --- FULL NAME ---
      if (
        /\b(full[_\s-]?name|applicant[_\s-]?name|candidate[_\s-]?name|legal\s+name|^name$)\b/i.test(ctx) &&
        !/\b(first|last|middle|user|file|company|org)\b/i.test(ctx)
      ) {
        if (setNativeValue(el, p.fullName)) filledCount++;
        continue;
      }

      // --- EMAIL ---
      if (/\b(email|e-mail)\b/i.test(ctx) && el.type !== 'checkbox') {
        if (setNativeValue(el, p.email)) filledCount++;
        continue;
      }

      // --- PHONE / MOBILE ---
      if (/\b(phone|mobile|contact[_\s-]?number|tel|cell)\b/i.test(ctx)) {
        if (setNativeValue(el, p.phone)) filledCount++;
        continue;
      }

      // --- LINKEDIN ---
      if (/linkedin/i.test(ctx)) {
        if (setNativeValue(el, p.linkedin)) filledCount++;
        continue;
      }

      // --- GITHUB ---
      if (/github/i.test(ctx)) {
        if (setNativeValue(el, p.github)) filledCount++;
        continue;
      }

      // --- PORTFOLIO / WEBSITE ---
      if (/\b(portfolio|website|personal[_\s-]?url|web[_\s-]?page|blog)\b/i.test(ctx)) {
        if (setNativeValue(el, p.portfolio)) filledCount++;
        continue;
      }

      // --- CITY / LOCATION ---
      if (/\b(city|current[_\s-]?location|current[_\s-]?city|residence)\b/i.test(ctx)) {
        if (setNativeValue(el, p.city)) filledCount++;
        continue;
      }

      // --- DEGREE / MAJOR ---
      if (/\b(degree|major|qualification|discipline|field\s+of\s+study|stream)\b/i.test(ctx)) {
        if (el.tagName === 'SELECT') {
          if (setSelectValue(el, 'bachelor')) filledCount++;
        } else {
          if (setNativeValue(el, p.degree)) filledCount++;
        }
        continue;
      }

      // --- UNIVERSITY / COLLEGE ---
      if (/\b(university|college|school|institution)\b/i.test(ctx)) {
        if (setNativeValue(el, p.college)) filledCount++;
        continue;
      }

      // --- GRADUATION YEAR ---
      if (/\b(graduat(ion|e)[_\s-]?year|passing[_\s-]?year|year\s+of\s+passing|completion\s+year)\b/i.test(ctx)) {
        if (el.tagName === 'SELECT') {
          if (setSelectValue(el, p.gradYear)) filledCount++;
        } else {
          if (setNativeValue(el, p.gradYear)) filledCount++;
        }
        continue;
      }

      // --- CGPA / GPA ---
      if (/\b(cgpa|gpa|percentage|marks)\b/i.test(ctx)) {
        if (setNativeValue(el, p.cgpa)) filledCount++;
        continue;
      }

      // --- YEARS OF EXPERIENCE QUESTIONS (LinkedIn / Custom) ---
      if (
        /\b(how\s+many\s+years|years\s+of\s+(work\s+)?experience|total\s+experience|relevant\s+experience)\b/i.test(ctx) &&
        (el.type === 'number' || el.type === 'text' || el.tagName === 'SELECT')
      ) {
        if (el.tagName === 'SELECT') {
          if (setSelectValue(el, '0') || setSelectValue(el, '1')) filledCount++;
        } else {
          if (setNativeValue(el, p.experienceYears || '0')) filledCount++;
        }
        continue;
      }

      // --- NOTICE PERIOD ---
      if (/\b(notice\s*period|availability|serving\s*notice|how\s+soon)\b/i.test(ctx)) {
        if (el.tagName === 'SELECT') {
          if (setSelectValue(el, 'immediate') || setSelectValue(el, '0')) filledCount++;
        } else {
          if (setNativeValue(el, p.noticePeriod)) filledCount++;
        }
        continue;
      }

      // --- EXPECTED CTC / SALARY ---
      if (/\b(expected\s*(ctc|salary|compensation|package)|target\s*salary)\b/i.test(ctx)) {
        if (setNativeValue(el, p.expectedCTC)) filledCount++;
        continue;
      }

      // --- CURRENT CTC ---
      if (/\b(current\s*(ctc|salary|compensation|package))\b/i.test(ctx)) {
        if (setNativeValue(el, p.currentCTC)) filledCount++;
        continue;
      }

      // --- WORK AUTHORIZATION (Radio / Select / Checkbox) ---
      if (/\b(authorized\s+to\s+work|legally\s+authorized|work\s+permit|eligible\s+to\s+work)\b/i.test(ctx)) {
        if (el.type === 'radio') {
          const radioCtx = getFieldContext(el);
          if (/\byes\b/i.test(radioCtx) || el.value === 'yes' || el.value === '1') {
            if (setRadioValue(el, true)) filledCount++;
          }
        } else if (el.tagName === 'SELECT') {
          if (setSelectValue(el, 'yes')) filledCount++;
        }
        continue;
      }

      // --- VISA SPONSORSHIP REQUIREMENT ---
      if (/\b(require\s+sponsorship|visa\s+sponsorship|need\s+sponsorship)\b/i.test(ctx)) {
        if (el.type === 'radio') {
          const radioCtx = getFieldContext(el);
          if (/\bno\b/i.test(radioCtx) || el.value === 'no' || el.value === '0') {
            if (setRadioValue(el, true)) filledCount++;
          }
        } else if (el.tagName === 'SELECT') {
          if (setSelectValue(el, 'no')) filledCount++;
        }
        continue;
      }

      // --- GENDER ---
      if (/\b(gender|sex)\b/i.test(ctx)) {
        if (el.tagName === 'SELECT') {
          if (setSelectValue(el, 'male') || setSelectValue(el, 'prefer not')) filledCount++;
        } else if (el.type === 'radio') {
          if (/\bmale\b/i.test(ctx)) {
            if (setRadioValue(el, true)) filledCount++;
          }
        }
        continue;
      }

      // --- WELLFOUND / RECRUITER NOTE: "WHAT INTERESTS YOU ABOUT WORKING FOR THIS COMPANY?" ---
      const isWhyCompanyQuestion =
        el.tagName === 'TEXTAREA' &&
        /\b(what\s+interests\s+you|why\s+(do\s+you\s+want\s+to\s+work|are\s+you\s+interested|join)|note\s+to\s+(recruiter|hiring|team)|about\s+working\s+for\s+this\s+company|pitch|tell\s+the\s+company\s+why)\b/i.test(ctx);

      if (isWhyCompanyQuestion) {
        const meta = detectCompanyAndRole();
        let note = null;

        if (p.geminiApiKey && p.geminiApiKey.trim().length > 10) {
          setNativeValue(el, `✨ Generating tailored note with AI for ${meta.company}...`);
          const snippet = getJobSnippet();
          note = await generateWithGemini(p.geminiApiKey.trim(), meta.company, meta.role, snippet, p);
        }

        if (!note) {
          note = generateTailoredCompanyNote(meta.company, meta.role, p);
        }

        if (setNativeValue(el, note)) filledCount++;
        continue;
      }

      // --- GENERAL SUMMARY / COVER LETTER / NOTES ---
      if (el.tagName === 'TEXTAREA' && /\b(summary|cover\s*letter|tell\s+us|notes|additional)\b/i.test(ctx)) {
        if (setNativeValue(el, p.summary)) filledCount++;
        continue;
      }

      // --- MATCH AGAINST ADAPTIVE LEARNED FIELDS BANK ---
      // E.g. Age, Pincode, Relocation, Father's Name, Custom Questions
      let matchedLearned = false;
      for (const [key, item] of Object.entries(learnedFields)) {
        const itemVal = item.value;
        const itemLabel = (item.label || key).toLowerCase();
        const keyPattern = new RegExp(`\\b${key.replace(/_/g, '[_\\s-]?')}\\b`, 'i');
        const labelPattern = new RegExp(`\\b${itemLabel.replace(/[^a-z0-9]+/gi, '[_\\s-]?')}\\b`, 'i');

        if (keyPattern.test(ctx) || labelPattern.test(ctx)) {
          if (el.tagName === 'SELECT') {
            if (setSelectValue(el, itemVal)) {
              filledCount++;
              matchedLearned = true;
              break;
            }
          } else if (el.type === 'radio') {
            const radioCtx = getFieldContext(el);
            if (radioCtx.includes(itemVal.toLowerCase())) {
              if (setRadioValue(el, true)) {
                filledCount++;
                matchedLearned = true;
                break;
              }
            }
          } else {
            if (setNativeValue(el, itemVal)) {
              filledCount++;
              matchedLearned = true;
              break;
            }
          }
        }
      }
      if (matchedLearned) continue;
    }

    // Show floating on-page toast notification
    showOnPageToast(filledCount);

    return filledCount;
  }

  /**
   * Floating Toast Notification on Webpage
   */
  function showOnPageToast(count) {
    const existing = document.getElementById('winter-arc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'winter-arc-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '9999999';
    toast.style.backgroundColor = '#0A0B10';
    toast.style.color = '#FFFFFF';
    toast.style.border = '1px solid #6D001A';
    toast.style.borderRadius = '12px';
    toast.style.padding = '14px 18px';
    toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    toast.style.fontSize = '13px';
    toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(109, 0, 26, 0.4)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.transform = 'translateY(0)';

    toast.innerHTML = `
      <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:#6D001A;color:#FFF;border-radius:6px;font-weight:bold;font-size:12px;">⚡</span>
      <div>
        <div style="font-weight:600;color:#FFF;">Winter Arc Autofill</div>
        <div style="color:#A1A1AA;font-size:11px;">
          ${count > 0 ? `Autofilled <strong>${count}</strong> field${count > 1 ? 's' : ''} on this form.` : 'No empty matching fields detected on this page.'}
        </div>
      </div>
      <button style="margin-left:8px;background:none;border:none;color:#71717A;cursor:pointer;font-size:14px;" onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }

  // Initialize Adaptive Form Learning
  setupAdaptiveLearning();

  // Listen for messages from popup or background service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'AUTOFILL') {
      runAutofill(message.profile || {}).then((count) => {
        sendResponse({ success: true, count: count });
      });
      return true; // Keep channel open for async response
    }
    return true;
  });

})();
