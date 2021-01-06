/**
 * Maps a value from one range of values to its equivalent, scaled in proportion to another range of values, using maximum and minimum.
 *
 * @param value input number
 * @param min1 Minimum value in the range of the input.
 * @param max1 Maximum value in the range of the input.
 * @param min2 Minimum value in the range of the output.
 * @param max2 Maximum value in the range of the output.
 *
 */
export function map(
  value: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number
) {
  let range1 = max1 - min1
  let range2 = max2 - min2

  return ((value - min1) / range1) * range2 + min2
}

// constrain
/**
 * Clamps a value so that it doesn't exceed a minimum or a maximum value.
 *
 * @param value input number
 * @param min Minimum value in the range of the output.
 * @param max Maximum value in the range of the output.
 *
 */
export function clamp(value: number, min: number, max: number) {
  let result = value

  if (value > max) {
    result = max
  } else if (value < min) {
    result = min
  }
  return result
}
