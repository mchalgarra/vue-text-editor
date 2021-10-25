/**
 * Calculates the file size and adds its unit (B, KB, MB, GB).
 *
 * @param size The file size.
 * @returns A string containing the rounded size with its unit (B, KB, MB, GB).
 */
export function calculateFileSize(size: number): string {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1048576) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1073741824) {
    return (size / 1048576).toFixed(2) + ' MB'
  } else {
    return (size / 1073741824).toFixed(2) + ' GB'
  }
}
