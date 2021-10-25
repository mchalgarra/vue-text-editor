/**
 * Calculates the brightness of the given color (dark or bright).
 *
 * @param color The color in RGB or HEX format.
 * @returns A number that represents the color brightness (dark is <= 170 approximately)
 */
export function calculateColorBrightness(color: string): number {
  let r: number | string
  let g: number | string
  let b: number | string

  let colorAux: RegExpMatchArray | number | boolean | null = null

  if (color.match(/^rgb/)) {
    colorAux = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/,
    )

    r = color[1]
    g = color[2]
    b = color[3]
  } else {
    colorAux = +(
      '0x' +
      color.slice(1).replace((color.length < 5 && /./g) as RegExp, '$&$&')
    )

    r = colorAux >> 16
    g = (colorAux >> 8) & 255
    b = colorAux & 255
  }

  const hsp = Math.sqrt(
    0.299 * ((r as number) * (r as number)) +
      0.587 * ((g as number) * (g as number)) +
      0.114 * ((b as number) * (b as number)),
  )

  return hsp
}

/**
 * Converts a RGBA color into the HEXA format.
 *
 * @param color The RGBA formatted color.
 * @returns An HEXA formatted color.
 *
 * @example
 * ```js
 * rgba2hex('rgba(255, 0, 0, 1)') => '#FF0000FF'
 * ```
 */
export function rgba2hex(color: string): string {
  let a: number | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rgb: any = color
    .replace(/\s/g, '')
    .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
  const alpha = ((rgb && rgb[4]) || '').trim()
  let hex = rgb
    ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
      (rgb[2] | (1 << 8)).toString(16).slice(1) +
      (rgb[3] | (1 << 8)).toString(16).slice(1)
    : color

  if (alpha !== '') {
    a = alpha
  } else {
    a = 1
  }
  // multiply before convert to HEX
  a = (((a as number) * 255) | (1 << 8)).toString(16).slice(1)
  hex = hex + a

  return '#' + hex
}
