import { Problem, ProblemSchema, Application } from './schemas';
import { initProblemRevision } from './revision';
import { parseProblemUrl } from './url-parser';
import { todayIST } from './time';

export interface CsvDuplicateItem {
  rowNumber: number;
  title: string;
  url: string;
}

export interface CsvErrorItem {
  rowNumber: number;
  raw: string;
  error: string;
}

export interface CsvParseResult {
  valid: Problem[];
  duplicates: CsvDuplicateItem[];
  errors: CsvErrorItem[];
  totalRows: number;
}

/**
 * Splits a CSV text into array of rows and array of columns per row,
 * properly respecting RFC 4180 quoted cells containing commas, escaped quotes (""), and newlines.
 */
export function parseCsvRaw(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          currentCell += '"';
          i++;
        } else {
          // Closing quote
          insideQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Handle final cell / row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header strings for flexible matching.
 * e.g. "Problem Title", "title", "Title" -> "title"
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses Notion/spreadsheet CSV exports into Problem records.
 * Supports flexible column naming and dry-run preview.
 */
export function parseProblemsCsv(
  csvText: string,
  existingUrls: Set<string> = new Set(),
  defaultDate: string = todayIST(),
): CsvParseResult {
  const rawRows = parseCsvRaw(csvText);
  if (rawRows.length === 0) {
    return { valid: [], duplicates: [], errors: [], totalRows: 0 };
  }

  const headerRow = rawRows[0] ?? [];
  const normalizedHeaders = headerRow.map(normalizeHeader);

  // Column index lookups
  const findCol = (aliases: string[]) => {
    return normalizedHeaders.findIndex((h) =>
      aliases.some((alias) => h === alias || h.includes(alias)),
    );
  };

  const titleIdx = findCol(['title', 'problem', 'name']);
  const urlIdx = findCol(['url', 'link']);
  const patternIdx = findCol(['pattern', 'topic', 'category']);
  const diffIdx = findCol(['difficulty', 'diff', 'level']);
  const dateIdx = findCol(['date', 'solvedat', 'createdat', 'solved']);
  const outcomeIdx = findCol(['outcome', 'status', 'result']);
  const timeIdx = findCol(['time', 'timetaken', 'duration']);
  const insightIdx = findCol(['insight', 'notes', 'trick', 'keyinsight']);

  if (titleIdx === -1) {
    return {
      valid: [],
      duplicates: [],
      errors: [
        {
          rowNumber: 1,
          raw: headerRow.join(','),
          error: 'Missing required "Title" or "Problem" column header in CSV.',
        },
      ],
      totalRows: 0,
    };
  }

  const valid: Problem[] = [];
  const duplicates: CsvDuplicateItem[] = [];
  const errors: CsvErrorItem[] = [];
  const seenUrlsInBatch = new Set<string>();

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r] ?? [];
    const rowNumber = r + 1; // 1-based line number in file

    const title = (row[titleIdx] ?? '').trim();
    if (!title) {
      errors.push({
        rowNumber,
        raw: row.join(','),
        error: 'Missing problem title',
      });
      continue;
    }

    const rawUrl = urlIdx !== -1 ? (row[urlIdx] ?? '').trim() : '';
    const pattern =
      patternIdx !== -1 && (row[patternIdx] ?? '').trim()
        ? (row[patternIdx] ?? '').trim()
        : 'Arrays & Hashing';

    // Difficulty normalization
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (diffIdx !== -1) {
      const rawDiff = (row[diffIdx] ?? '').toLowerCase().trim();
      if (rawDiff.includes('easy')) difficulty = 'easy';
      else if (rawDiff.includes('hard')) difficulty = 'hard';
      else difficulty = 'medium';
    }

    // Outcome normalization
    let outcome: 'clean' | 'hinted' | 'failed' = 'clean';
    if (outcomeIdx !== -1) {
      const rawOutcome = (row[outcomeIdx] ?? '').toLowerCase().trim();
      if (rawOutcome.includes('hint')) outcome = 'hinted';
      else if (rawOutcome.includes('fail')) outcome = 'failed';
      else outcome = 'clean';
    }

    // Date normalization
    let solvedAt = defaultDate;
    if (dateIdx !== -1 && (row[dateIdx] ?? '').trim()) {
      const dateVal = (row[dateIdx] ?? '').trim();
      // Match YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        solvedAt = dateVal;
      } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateVal)) {
        solvedAt = dateVal.replace(/\//g, '-');
      }
    }

    // Time taken
    let timeTakenMin = 20;
    if (timeIdx !== -1 && (row[timeIdx] ?? '').trim()) {
      const parsedTime = parseInt((row[timeIdx] ?? '').replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedTime) && parsedTime >= 0) {
        timeTakenMin = parsedTime;
      }
    }

    const insight = insightIdx !== -1 ? (row[insightIdx] ?? '').trim().slice(0, 200) : '';

    // URL & Duplicate detection
    const parsedUrl = rawUrl ? parseProblemUrl(rawUrl) : null;
    const finalUrl = parsedUrl?.canonicalUrl || rawUrl;
    const platform = parsedUrl?.platform || 'leetcode';

    if (finalUrl) {
      const normalizedUrl = finalUrl.toLowerCase().replace(/\/$/, '');
      if (existingUrls.has(normalizedUrl) || seenUrlsInBatch.has(normalizedUrl)) {
        duplicates.push({
          rowNumber,
          title,
          url: finalUrl,
        });
        continue;
      }
      seenUrlsInBatch.add(normalizedUrl);
    }

    // Revision state calculation via Spec 7.4
    const revision = initProblemRevision(solvedAt, outcome, timeTakenMin);

    const problemData: Problem = {
      title,
      url: finalUrl,
      platform,
      pattern,
      difficulty,
      solvedAt,
      timeTakenMin,
      outcome,
      insight,
      stuckAt: '',
      complexity: { time: '', space: '' },
      tags: [],
      revision,
    };

    const validated = ProblemSchema.safeParse(problemData);
    if (!validated.success) {
      errors.push({
        rowNumber,
        raw: row.join(','),
        error: validated.error.errors.map((e) => e.message).join('; '),
      });
      continue;
    }

    valid.push(validated.data);
  }

  return {
    valid,
    duplicates,
    errors,
    totalRows: rawRows.length - 1,
  };
}

/**
 * Escapes a cell value for CSV export according to RFC 4180.
 */
function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports a list of Problem records into a standard CSV matching the import format.
 */
export function exportProblemsCsv(problems: Problem[]): string {
  const headers = [
    'title',
    'url',
    'pattern',
    'difficulty',
    'date',
    'outcome',
    'timeTakenMin',
    'insight',
    'step',
    'nextDue',
    'mastered',
  ];

  const lines = [headers.join(',')];

  for (const p of problems) {
    const row = [
      escapeCsvCell(p.title),
      escapeCsvCell(p.url),
      escapeCsvCell(p.pattern),
      escapeCsvCell(p.difficulty),
      escapeCsvCell(p.solvedAt),
      escapeCsvCell(p.outcome),
      escapeCsvCell(p.timeTakenMin),
      escapeCsvCell(p.insight),
      escapeCsvCell(p.revision.step),
      escapeCsvCell(p.revision.nextDue),
      escapeCsvCell(p.revision.mastered),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Serializes applications array to an RFC-4180 CSV string.
 */
export function exportApplicationsCsv(applications: Application[]): string {
  const headers = [
    'company',
    'role',
    'url',
    'source',
    'status',
    'appliedDate',
    'referral',
    'referrerName',
    'salaryLPA',
    'location',
    'followUpDate',
    'notes',
  ];

  const lines = [headers.join(',')];

  for (const a of applications) {
    const row = [
      escapeCsvCell(a.company),
      escapeCsvCell(a.role),
      escapeCsvCell(a.url),
      escapeCsvCell(a.source),
      escapeCsvCell(a.status),
      escapeCsvCell(a.appliedDate || ''),
      escapeCsvCell(a.referral ? 'true' : 'false'),
      escapeCsvCell(a.referrerName || ''),
      escapeCsvCell(a.salaryLPA !== undefined ? a.salaryLPA : ''),
      escapeCsvCell(a.location || ''),
      escapeCsvCell(a.followUpDate || ''),
      escapeCsvCell(a.notes || ''),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}
