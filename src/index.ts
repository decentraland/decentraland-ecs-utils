import { MoveTransformComponent } from './transform/component/move'
import { RotateTransformComponent } from './transform/component/rotate'
import { ScaleTransformComponent } from './transform/component/scale'
import { FollowPathComponent } from './transform/component/followpath'
import { KeepRotatingComponent } from './transform/component/keeprotating'
import { TransformSystem } from './transform/system/transfromSystem'
import { Interpolate, InterpolationType } from './transform/math/interpolation'

import { ToggleComponent, ToggleState } from './toggle/toggleComponent'

import { Delay } from './timer/component/delay'
import { ExpireIn } from './timer/component/expire'
import { Interval } from './timer/component/interval'
import {
  map,
  clamp,
  getEntityWorldPosition,
  getEntityWorldRotation
} from './helpers/helperfunctions'
import { addTestCube, addLabel } from './helpers/testCube'
import { sendRequest } from './helpers/requests'
import {
  TriggerSystem,
  TriggerBoxShape,
  TriggerSphereShape,
  TriggerComponent
} from './triggers/triggerSystem'

import { ActionsSequenceSystem } from './actionsSequenceSystem/actionsSequenceSystem'

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
  Interval,
  TriggerComponent,
  TriggerSystem,
  TriggerSphereShape,
  TriggerBoxShape,
  ActionsSequenceSystem,
  map,
  clamp,
  addTestCube,
  addLabel,
  sendRequest,
  getEntityWorldPosition,
  getEntityWorldRotation
}
