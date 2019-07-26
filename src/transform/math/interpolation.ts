export enum InterpolationType {
  LINEAR,
  EASEINQUAD,
  EASEOUTQUAD,
  EASEQUAD
}

export function Interpolate(type: InterpolationType, t: number): number {
  switch (type) {
    case InterpolationType.LINEAR:
      return InterpolateLinear(t)
    case InterpolationType.EASEINQUAD:
      return InterpolateEaseInQuad(t)
    case InterpolationType.EASEOUTQUAD:
      return InterpolateEaseOutQuad(t)
    case InterpolationType.EASEQUAD:
      return InterpolateEaseQuad(t)
    default:
      return InterpolateLinear(t)
  }
}
function InterpolateLinear(t: number): number {
  return t
}
function InterpolateEaseInQuad(t: number): number {
  return t * t
}
function InterpolateEaseOutQuad(t: number): number {
  return t * (2 - t)
}
function InterpolateEaseQuad(t: number): number {
  return (t * t) / (2.0 * (t * t - t) + 1.0)
}
