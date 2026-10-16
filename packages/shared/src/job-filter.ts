/**
 * Job Location Filtering Domain Logic
 * Strictly filters job listings to India or Remote/Worldwide positions.
 */

const INDIA_KEYWORDS = [
  'india',
  'bengaluru',
  'bangalore',
  'hyderabad',
  'pune',
  'mumbai',
  'delhi',
  'ncr',
  'gurgaon',
  'gurugram',
  'noida',
  'chennai',
  'kolkata',
  'ahmedabad',
  'jaipur',
  'kochi',
  'cochin',
  'thiruvananthapuram',
  'chandigarh',
  'indore',
  'bhubaneswar',
  'karnataka',
  'maharashtra',
  'telangana',
  'tamil nadu',
  'haryana',
  'uttar pradesh',
];

const NON_INDIA_KEYWORDS = [
  'china',
  'shenzhen',
  'beijing',
  'shanghai',
  'united states',
  'usa',
  'u.s.',
  'canada',
  'united kingdom',
  'london',
  'uk',
  'ireland',
  'dublin',
  'germany',
  'berlin',
  'munich',
  'france',
  'paris',
  'netherlands',
  'amsterdam',
  'spain',
  'madrid',
  'barcelona',
  'australia',
  'sydney',
  'melbourne',
  'singapore',
  'japan',
  'tokyo',
  'brazil',
  'mexico',
  'poland',
  'sweden',
  'switzerland',
  'emea',
  'latam',
  'americas',
  'us only',
  'north america',
];

const REMOTE_KEYWORDS = [
  'remote',
  'work from home',
  'wfh',
  'anywhere',
  'worldwide',
  'global',
  'virtual',
  'telecommute',
];

/**
 * Returns true if the job is based in India or is an eligible open remote position.
 * Returns false if the role is restricted to a foreign physical location or foreign country.
 */
export function isIndiaOrRemote(rawLocation?: string): boolean {
  if (!rawLocation || rawLocation.trim() === '') return true;

  const loc = rawLocation.toLowerCase().trim();

  // 1. If location specifies India, always accept
  for (const kw of INDIA_KEYWORDS) {
    if (loc.includes(kw)) {
      return true;
    }
  }

  // 2. If location specifies a foreign country or non-Indian region, reject even if labeled "home based" or "remote"
  for (const nonIndia of NON_INDIA_KEYWORDS) {
    if (loc.includes(nonIndia)) {
      return false;
    }
  }

  // 3. Open Remote / Worldwide roles without non-Indian restrictions
  for (const rk of REMOTE_KEYWORDS) {
    if (loc.includes(rk)) {
      return true;
    }
  }

  // If unspecified or non-matching other country, exclude
  return false;
}

/**
 * Disqualifying title patterns for jobs requiring more than 1 year of experience
 * or non-developer/specialized senior roles.
 */
const SENIOR_OR_MID_TITLE_PATTERNS = [
  /\b(?:sde|swe|engineer|developer|mts|qa|devops|architect|analyst)\s*[-_ ]*(?:ii|iii|iv|v|2|3|4|5|vi)\b/i,
  /\b(?:level|lvl)\s*[-_ ]*(?:2|3|4|5|ii|iii|iv)\b/i,
  /\b(?:l2|l3|l4|l5)\b/i,
  /\b(?:senior|sr\.?|lead|principal|staff|director|head|manager|vp|architect|chief|specialist|expert)\b/i,
  /\b(?:mid[- ]level|intermediate|experienced)\b/i,
  /\b(?:sales engineer|field engineer|solutions? architect|customer experience|account executive|talent|recruiter|operations? manager)\b/i,
];

/**
 * Extracts minimum years of experience mentioned in text, or null if unspecified.
 */
export function extractExperienceYears(text?: string): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Pattern: "X-Y years of experience" or "X to Y years of experience"
  const rangeMatch = lower.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)(?:\s+of)?(?:\s+relevant)?\s+experience/);
  if (rangeMatch && rangeMatch[1]) {
    return parseInt(rangeMatch[1], 10);
  }

  // Pattern: "minimum X years of experience" or "at least X years"
  const minMatch = lower.match(/(?:minimum|at\s+least|min\.?)\s+(\d+)\s*(?:years?|yrs?)(?:\s+of)?(?:\s+relevant)?\s+experience/);
  if (minMatch && minMatch[1]) {
    return parseInt(minMatch[1], 10);
  }

  // Pattern: "X+ years of experience" or "X years of experience"
  const singleMatch = lower.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+relevant)?\s+experience/);
  if (singleMatch && singleMatch[1]) {
    return parseInt(singleMatch[1], 10);
  }

  return null;
}

/**
 * Evaluates whether a job is strictly Entry-Level (0 to 1 year of experience).
 * Rejects any role requiring >1 year of experience or tagged with mid/senior/Level 2+ titles.
 */
export function isEntryLevel(title: string, description?: string, explicitExpYears?: number): boolean {
  if (explicitExpYears !== undefined && explicitExpYears > 1) {
    return false;
  }

  const trimmedTitle = title.trim();

  // 1. Check title for Senior, Lead, Level 2+, or non-entry markers
  for (const pattern of SENIOR_OR_MID_TITLE_PATTERNS) {
    if (pattern.test(trimmedTitle)) {
      return false;
    }
  }

  // 2. Check description for experience requirements > 1 year
  if (description) {
    const exp = extractExperienceYears(description);
    if (exp !== null && exp > 1) {
      return false;
    }
  }

  return true;
}

