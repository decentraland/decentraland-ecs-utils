import { ITimerComponent } from './itimercomponent'
import { TimerSystem } from '../system/timerSystem'

/**
 * Execute every X milliseconds
 * @public
 */
@Component('timerInterval')
export class Interval implements ITimerComponent {
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (ownerEntity: IEntity) => void

  private onTimeReachedCallback?: () => void

  /**
   * @param millisecs - amount of time in milliseconds
   * @param onTimeReachedCallback - callback for when time is reached
   */
  constructor(millisecs: number, onTimeReachedCallback?: () => void) {
    let instance = TimerSystem.createAndAddToEngine()
    instance.addComponentType(Interval)

    this.elapsedTime = 0
    this.targetTime = millisecs / 1000
    this.onTimeReachedCallback = onTimeReachedCallback
    this.onTargetTimeReached = () => {
      this.elapsedTime = 0
      if (this.onTimeReachedCallback) this.onTimeReachedCallback()
    }
  }

  setCallback(onTimeReachedCallback: () => void) {
    this.onTimeReachedCallback = onTimeReachedCallback
  }
}
