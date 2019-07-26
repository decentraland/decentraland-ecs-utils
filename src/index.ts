import { MoveTransformComponent } from './transform/component/move'
import { RotateTransformComponent } from './transform/component/rotate'
import { ScaleTransformComponent } from './transform/component/scale'
import { FollowPathComponent } from './transform/component/followpath'
import { KeepRotatingComponent } from './transform/component/keeprotating'
import { TransformSystem } from './transform/system/transfromSystem'
import { Interpolate, InterpolationType } from './transform/math/interpolation'

import { ToggleComponent, ToggleState } from './toggle/toggleComponent'

import { Delay } from "./timer/component/delay";
import { ExpireIn } from "./timer/component/expire";
import { Interval } from "./timer/component/interval";

export default {
  TransformSystem,
  MoveTransformComponent,
  RotateTransformComponent,
  ScaleTransformComponent,
  FollowPathComponent,
  KeepRotatingComponent,
  Interpolate,
  InterpolationType,
  ToggleComponent,
  ToggleState,
  Delay,
  ExpireIn,
  Interval
}
