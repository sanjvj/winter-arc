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
