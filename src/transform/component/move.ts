import { ITransformComponent } from './itransformcomponent'
import { TransformSystem } from '../system/transfromSystem'
import { InterpolationType, Interpolate } from '../math/interpolation'

/**
 * Component to translate entity from one position (start) to another (end) in an amount of time
 */
@Component('moveTransformComponent')
export class MoveTransformComponent implements ITransformComponent {
  private start: ReadOnlyVector3
  private end: ReadOnlyVector3
  private speed: number
  private normalizedTime: number
  private interpolationType: InterpolationType
  private lerpTime: number

  onFinishCallback?: () => void

  /**
   * Create a MoveTransformComponent instance to add as a component to a Entity
   * @param start starting position
   * @param end ending position
   * @param duration duration (in seconds) of start to end translation
   * @param onFinishCallback called when translation ends
   * @param interpolationType type of interpolation to be used (default: LINEAR)
   */
  constructor(
    start: ReadOnlyVector3,
    end: ReadOnlyVector3,
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

    TransformSystem.createAndAddToEngine()
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
    transform.position = Vector3.Lerp(this.start, this.end, this.lerpTime)
  }
}
