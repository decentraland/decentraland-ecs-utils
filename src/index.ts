import TimerUtils from './timer/index'

import { MoveTransformComponent } from './transform/component/move'
import { RotateTransformComponent } from './transform/component/rotate'
import { ScaleTransformComponent } from './transform/component/scale'
import { FollowPathComponent } from './transform/component/followpath'
import { KeepRotatingComponent } from './transform/component/keeprotating'
import { TransformSystem } from './transform/system/transfromSystem'
import { Interpolate, InterpolationType } from './transform/math/interpolation'

import { ToggleComponent, ToggleState } from './toggle/toggleComponent'

export default {
  TimerUtils,
  TransformSystem,
  MoveTransformComponent,
  RotateTransformComponent,
  ScaleTransformComponent,
  FollowPathComponent,
  KeepRotatingComponent,
  Interpolate,
  InterpolationType,
  ToggleComponent,
  ToggleState
}
