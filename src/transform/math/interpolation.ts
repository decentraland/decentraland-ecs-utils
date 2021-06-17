/**
 * @public
 */
export enum InterpolationType {
  LINEAR,

  EASEINQUAD,
  EASEOUTQUAD,
  EASEQUAD,

  EASEINSINE = 'easeinsine',
  EASEOUTSINE = 'easeoutsine',
  EASESINE = 'easeinoutsine',

  EASEINEXPO = 'easeinexpo',
  EASEOUTEXPO = 'easeoutexpo',
  EASEEXPO = 'easeinoutexpo',

  EASEINELASTIC = 'easeinelastic',
  EASEOUTELASTIC = 'easeoutelastic',
  EASEELASTIC = 'easeinoutelastic',

  EASEINBOUNCE = 'easeinbounce',
  EASEOUTEBOUNCE = 'easeoutbounce',
  EASEBOUNCE = 'easeinoutbounce',
}

/**
 * @public
 */
export function Interpolate(type: InterpolationType, t: number): number {
  switch (type) {
    case InterpolationType.LINEAR:
      	return InterpolateLinear(t)
		break
    case InterpolationType.EASEINQUAD:
      	return InterpolateEaseInQuad(t)
		break
    case InterpolationType.EASEOUTQUAD:
      	return InterpolateEaseOutQuad(t)
		break
    case InterpolationType.EASEQUAD:
      	return InterpolateEaseQuad(t)
		break
	case InterpolationType.EASEINSINE:
		return InterpolateEaseInSine(t)
		break
	case InterpolationType.EASEOUTSINE:
		return InterpolateEaseOutSine(t)
		break
	case InterpolationType.EASESINE:
		return InterpolateEaseInOutSine(t)
		break
	case InterpolationType.EASEINEXPO:
		return InterpolateEaseInExpo(t)
		break
	case InterpolationType.EASEOUTEXPO:
		return InterpolateEaseOutExpo(t)
		break
	case InterpolationType.EASEEXPO:
		return InterpolateEaseInOutExpo(t)
		break
	case InterpolationType.EASEINELASTIC:
		return InterpolateEaseInElastic(t)
		break
	case InterpolationType.EASEOUTELASTIC:
		return InterpolateEaseOutElastic(t)
		break	
	case InterpolationType.EASEELASTIC:
		return InterpolateEaseInOutElastic(t)
		break
	case InterpolationType.EASEINBOUNCE:
		return InterpolateEaseInBounce(t)
		break
	case InterpolationType.EASEOUTEBOUNCE:
		return InterpolateEaseOutBounce(t)
		break
	case InterpolationType.EASEBOUNCE:
		return InterpolateEaseInOutBounce(t)
		break
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

function InterpolateEaseInSine(t: number): number {
	return 1 - Math.cos((t * Math.PI) / 2)
}

function InterpolateEaseOutSine(t: number): number {
	return Math.sin((t * Math.PI) / 2)
}

function InterpolateEaseInOutSine(t: number): number {
	return -(Math.cos(Math.PI * t) - 1) / 2
}

function InterpolateEaseInExpo(t: number): number {
	return t === 0 ? 0 : Math.pow(2, 10 * t - 10)
}

function InterpolateEaseOutExpo(t: number): number {
	return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function InterpolateEaseInOutExpo(t: number): number {
	return t === 0
			? 0
			: t === 1
			? 1
			: t < 0.5
			? Math.pow(2, 20 * t - 10) / 2
			: (2 - Math.pow(2, -20 * t + 10)) / 2
}


function InterpolateEaseInElastic(t: number): number {
	const c4 = (2 * Math.PI) / 3
	
	return t === 0
			? 0
			: t === 1
			? 1
			: -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
}

function InterpolateEaseOutElastic(t: number): number {
	const c5 = (2 * Math.PI) / 3
	
	return t === 0
			? 0
			: t === 1
			? 1
			: Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1
}

function InterpolateEaseInOutElastic(t: number): number {
	const c6 = (2 * Math.PI) / 4.5
	
	return t === 0
			? 0
			: t === 1
			? 1
			: t < 0.5
			? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c6)) / 2
			: (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c6)) / 2 + 1
}

function InterpolateEaseInBounce(t: number): number {
	return 1 - bounce(1 - t)
}

function InterpolateEaseOutBounce(t: number): number {
	return bounce(t)
}

function InterpolateEaseInOutBounce(t: number): number {
	return t < 0.5 ? (1 - bounce(1 - 2 * t)) / 2 : (1 + bounce(2 * t - 1)) / 2
}

	
function bounce(x: number) {
	const n1 = 7.5625
	const d1 = 2.75

	if (x < 1 / d1) {
		return n1 * x * x
	} else if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.75
	} else if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9375
	} else {
		return n1 * (x -= 2.625 / d1) * x + 0.984375
	}
}