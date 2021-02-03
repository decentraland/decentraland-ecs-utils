import { ITransformComponent } from './itransformcomponent'
import { TransformSystem } from '../system/transfromSystem'

/**
 * Component to move an entity down a fixed path in a given amount of time
 */
@Component('followPathComponent')
export class FollowPathComponent implements ITransformComponent {
  private points: Vector3[]
  private speed: number[] = []
  private normalizedTime: number
  private currentIndex: number

  onFinishCallback?: () => void
  onPointReachedCallback?: (currentPoint: Vector3, nextPoint: Vector3) => void

  /**
   * Create a FollowPathComponent instance to add as a component to a Entity
   * @param {Vector3[]} points array of points for the path
   * @param {number} duration duration of the movement through the path
   * @param {() => void} onFinishCallback called when movement ends
   * @param {(currentPoint: Vector3, nextPoint: Vector3) => void} onPointReachedCallback called everytime an entity reaches a point of the path
   */
  constructor(
    points: Vector3[],
    duration: number,
    onFinishCallback?: () => void,
    onPointReachedCallback?: (currentPoint: Vector3, nextPoint: Vector3) => void
  ) {
    this.normalizedTime = 0
    this.currentIndex = 0
    this.points = points
    this.onFinishCallback = onFinishCallback
    this.onPointReachedCallback = onPointReachedCallback

    if (points.length < 2) {
      throw new Error('At least 2 points are needed for FollowPathComponent.')
    }

    if (duration > 0) {
      let totalDist = 0
      let pointsDist = []
      for (let i = 0; i < points.length - 1; i++) {
        let sqDist = Vector3.Distance(points[i], points[i + 1])
        totalDist += sqDist
        pointsDist.push(sqDist)
      }
      for (let i = 0; i < pointsDist.length; i++) {
        this.speed.push(1 / ((pointsDist[i] / totalDist) * duration))
      }
    } else {
      this.normalizedTime = 1
      this.currentIndex = points.length - 2
    }

    let instance = TransformSystem.createAndAddToEngine()
    instance.addComponentType(FollowPathComponent)
  }

  update(dt: number) {
    this.normalizedTime = Scalar.Clamp(
      this.normalizedTime + dt * this.speed[this.currentIndex],
      0,
      1
    )
    if (
      this.normalizedTime >= 1 &&
      this.currentIndex < this.points.length - 2
    ) {
      this.currentIndex++
      this.normalizedTime = 0
      if (
        this.onPointReachedCallback &&
        this.currentIndex < this.points.length - 1
      )
        this.onPointReachedCallback(
          this.points[this.currentIndex],
          this.points[this.currentIndex + 1]
        )
    }
  }

  hasFinished(): boolean {
    return (
      this.currentIndex >= this.points.length - 2 && this.normalizedTime >= 1
    )
  }

  assignValueToTransform(transform: Transform) {
    transform.position = Vector3.Lerp(
      this.points[this.currentIndex],
      this.points[this.currentIndex + 1],
      this.normalizedTime
    )
  }
}

/**
 * Component to move a entity down a fixed path in an amount of time
 */
@Component('followCurvedPathComponent')
export class FollowCurvedPathComponent implements ITransformComponent {
  private points: Vector3[]
  private speed: number[] = []
  private normalizedTime: number
  private currentIndex: number
  private turnToFaceNext: boolean = false
  private facingNext: boolean = false

  onFinishCallback?: () => void

  /**
   * Create a FollowCurvedPathComponent instance to add as a component to a Entity
   * @param {Vector3[]} points array of points that the curve must pass through
   * @param {number} duration duration of the movement through the path
   * @param {number} numberOfSegments how many straight line segments to use to construct the curve
   * @param {boolean} turnToFaceNext if true, rotates for each segment to always look forward
   * @param {boolean} closedCircle if true, traces a circle that starts back at the beginning, keeping the curvature rounded in the seams too
   * @param {() => void} onFinishCallback called when movement ends
   */
  constructor(
    points: Vector3[],
    duration: number,
    numberOfSegments: number,
    turnToFaceNext?: boolean,
    closedCircle?: boolean,
    onFinishCallback?: () => void
  ) {
    this.normalizedTime = 0
    this.currentIndex = 0
    this.points = Curve3.CreateCatmullRomSpline(
      points,
      numberOfSegments,
      closedCircle ? true : false
    ).getPoints()
    this.onFinishCallback = onFinishCallback
    this.turnToFaceNext = turnToFaceNext ? turnToFaceNext : false

    if (this.points.length < 2) {
      throw new Error('At least 2 points are needed for FollowPathComponent.')
    }

    if (duration > 0) {
      let totalDist = 0
      let pointsDist = []
      for (let i = 0; i < this.points.length - 1; i++) {
        let sqDist = Vector3.Distance(this.points[i], this.points[i + 1])
        totalDist += sqDist
        pointsDist.push(sqDist)
      }
      for (let i = 0; i < pointsDist.length; i++) {
        this.speed.push(1 / ((pointsDist[i] / totalDist) * duration))
      }
    } else {
      this.normalizedTime = 1
      this.currentIndex = points.length - 2
    }

    let instance = TransformSystem.createAndAddToEngine()
    instance.addComponentType(FollowCurvedPathComponent)
  }

  update(dt: number) {
    this.normalizedTime = Scalar.Clamp(
      this.normalizedTime + dt * this.speed[this.currentIndex],
      0,
      1
    )
    if (
      this.normalizedTime >= 1 &&
      this.currentIndex < this.points.length - 2
    ) {
      this.currentIndex++
      this.normalizedTime = 0
      if (this.turnToFaceNext == true) {
        this.facingNext = false
      }
    }
  }

  hasFinished(): boolean {
    return (
      this.currentIndex >= this.points.length - 2 && this.normalizedTime >= 1
    )
  }

  assignValueToTransform(transform: Transform) {
    transform.position = Vector3.Lerp(
      this.points[this.currentIndex],
      this.points[this.currentIndex + 1],
      this.normalizedTime
    )

    if (!this.facingNext) {
      this.facingNext = true

      if (this.currentIndex < this.points.length - 1) {
        transform.lookAt(this.points[this.currentIndex + 1])
      } else {
        transform.lookAt(this.points[0])
      }
    }
  }
}
