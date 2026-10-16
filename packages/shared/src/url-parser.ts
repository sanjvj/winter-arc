export type ProblemPlatform = 'leetcode' | 'codeforces' | 'hackerrank' | 'gfg' | 'other';

export interface ParsedProblemUrl {
  platform: ProblemPlatform;
  title: string;
  slug: string;
  canonicalUrl: string;
}

/**
 * Converts a kebab-case or snake-case slug into a clean Title Case string.
 * Example: 'trapping-rain-water' -> 'Trapping Rain Water'
 * Example: 'subarray-with-given-sum-1587115621' -> 'Subarray With Given Sum'
 */
export function slugToTitle(slug: string): string {
  // Strip trailing numeric hashes (e.g., GFG style '-1587115621')
  const cleanSlug = slug.replace(/[-_]\d{6,}$/, '');

  return cleanSlug
    .split(/[-_]+/)
    .filter((word) => word.length > 0)
    .map((word) => {
      // If already uppercase (e.g., 'BFS', 'DP', 'II', 'III', 'IV'), preserve
      if (/^[A-Z0-9]+$/.test(word)) {
        return word;
      }
      // Roman numerals (i, ii, iii, iv, etc.)
      if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Parses a competitive programming / DSA problem URL to detect platform
 * and extract a sensible default title.
 */
export function parseProblemUrl(rawUrl: string): ParsedProblemUrl {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      platform: 'other',
      title: '',
      slug: '',
      canonicalUrl: '',
    };
  }

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. LeetCode: leetcode.com/problems/<slug>
    if (host.includes('leetcode.com')) {
      const match = pathname.match(/\/problems\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        const slug = match[1];
        return {
          platform: 'leetcode',
          title: slugToTitle(slug),
          slug,
          canonicalUrl: `https://leetcode.com/problems/${slug}/`,
        };
      }
      return {
        platform: 'leetcode',
        title: '',
        slug: '',
        canonicalUrl: parsed.origin + pathname,
      };
    }

    // 2. Codeforces: codeforces.com/problemset/problem/<contestId>/<index> or /contest/<contestId>/problem/<index>
    if (host.includes('codeforces.com')) {
      const problemsetMatch = pathname.match(/\/problemset\/problem\/(\d+)\/([a-zA-Z0-9]+)/);
      const contestMatch = pathname.match(/\/contest\/(\d+)\/problem\/([a-zA-Z0-9]+)/);
      const match = problemsetMatch || contestMatch;
      if (match && match[1] && match[2]) {
        const contestId = match[1];
        const index = match[2].toUpperCase();
        return {
          platform: 'codeforces',
          title: `CF ${contestId}${index}`,
          slug: `${contestId}/${index}`,
          canonicalUrl: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
        };
      }
      return {
        platform: 'codeforces',
        title: '',
        slug: '',
        canonicalUrl: parsed.origin + pathname,
      };
    }

    // 3. HackerRank: hackerrank.com/challenges/<slug>
    if (host.includes('hackerrank.com')) {
      const match = pathname.match(/\/challenges\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        const slug = match[1];
        return {
          platform: 'hackerrank',
          title: slugToTitle(slug),
          slug,
          canonicalUrl: `https://www.hackerrank.com/challenges/${slug}/problem`,
        };
      }
      return {
        platform: 'hackerrank',
        title: '',
        slug: '',
        canonicalUrl: parsed.origin + pathname,
      };
    }

    // 4. GeeksforGeeks: geeksforgeeks.org/problems/<slug>
    if (host.includes('geeksforgeeks.org')) {
      const match = pathname.match(/\/problems\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        const slug = match[1];
        return {
          platform: 'gfg',
          title: slugToTitle(slug),
          slug,
          canonicalUrl: `https://www.geeksforgeeks.org/problems/${slug}/1`,
        };
      }
      return {
        platform: 'gfg',
        title: '',
        slug: '',
        canonicalUrl: parsed.origin + pathname,
      };
    }

    // 5. Fallback generic URL
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    return {
      platform: 'other',
      title: slugToTitle(lastSegment),
      slug: lastSegment,
      canonicalUrl: parsed.href,
    };
  } catch {
    return {
      platform: 'other',
      title: '',
      slug: '',
      canonicalUrl: trimmed,
    };
  }
}
