import { ITransformComponent } from './itransformcomponent'
import { TransformSystem } from '../system/transfromSystem'
import { InterpolationType, Interpolate } from '../math/interpolation'

/**
 * Component to rotate entity from one rotation (start) to another (end) in an amount of time
 */
@Component('rotateTransformComponent')
export class RotateTransformComponent implements ITransformComponent {
  private start: ReadOnlyQuaternion
  private end: ReadOnlyQuaternion
  private speed: number
  private normalizedTime: number
  private interpolationType: InterpolationType
  private lerpTime: number

  onFinishCallback?: () => void

  /**
   * Create a RotateTransformComponent instance to add as a component to a Entity
   * @param {ReadOnlyQuaternion} start starting rotation
   * @param {ReadOnlyQuaternion} end ending rotation
   * @param {number} duration duration (in seconds) of start to end rotation
   * @param {() => void} onFinishCallback called when rotation ends
   * @param {InterpolationType} interpolationType type of interpolation to be used (default: LINEAR)
   */
  constructor(
    start: ReadOnlyQuaternion,
    end: ReadOnlyQuaternion,
    duration: number,
    onFinishCallback?: () => void,
    interpolationType: InterpolationType = InterpolationType.LINEAR
  ) {
    this.start = start
    this.end = end
    this.normalizedTime = 0
    this.lerpTime = 0
    this.onFinishCallback = onFinishCallback
    this.interpolationType = interpolationType

    if (duration != 0) {
      this.speed = 1 / duration
    } else {
      this.speed = 0
      this.normalizedTime = 1
      this.lerpTime = 1
    }

    let instance = TransformSystem.createAndAddToEngine()
    instance.addComponentType(RotateTransformComponent)
  }

  update(dt: number) {
    this.normalizedTime = Scalar.Clamp(
      this.normalizedTime + dt * this.speed,
      0,
      1
    )
    this.lerpTime = Interpolate(this.interpolationType, this.normalizedTime)
  }

  hasFinished(): boolean {
    return this.normalizedTime >= 1
  }

  assignValueToTransform(transform: Transform) {
    transform.rotation = Quaternion.Slerp(this.start, this.end, this.lerpTime)
  }
}
