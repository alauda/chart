/**
 * '4.0.0-prod-2.0-0' -> 'prod-2.0'
 *
 * @param {string} version
 * @returns {string} prod version
 */
export function getProdVersion(version) {
  const arr = version.split('-');
  return `${arr[1]}-${arr[2]}`;
}
