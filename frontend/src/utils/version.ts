/**
 * Robust version comparison utility for npm semver, Maven ComparableVersion, and PEP440.
 * Determines whether a version is vulnerable, clean, or fixed.
 */

export function parseVersionParts(v: string): number[] {
  // Strip prefixes like 'v', '^', '~', '>=', '<='
  const cleaned = v.replace(/^[v^~><=\s]+/, '').trim();
  const base = cleaned.split('-')[0].split('+')[0]; // strip pre-release / build metadata
  return base.split('.').map(part => {
    const num = parseInt(part.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  });
}

/**
 * Returns:
 *  1 if v1 > v2
 * -1 if v1 < v2
 *  0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  const p1 = parseVersionParts(v1);
  const p2 = parseVersionParts(v2);
  const maxLen = Math.max(p1.length, p2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Checks if currentVersion is affected by the vulnerability.
 * If currentVersion >= fixedVersion, it is NOT vulnerable (returns false).
 */
export function isVersionAffected(currentVersion: string, fixedVersion?: string, affectedBelow?: string): boolean {
  if (!currentVersion || currentVersion === '0.0.0') return true;

  const threshold = fixedVersion || affectedBelow;
  if (!threshold) return true;

  // If current version is greater than or equal to the fixed version, it is NOT affected!
  const cmp = compareVersions(currentVersion, threshold);
  return cmp < 0; // True only if current is strictly lower than fixed
}
