import { ITimerComponent } from './itimercomponent'
import { TimerSystem } from '../system/timerSystem'

/**
 * Remove entity after X milliseconds
 */
@Component('timerExpireIn')
export class ExpireIn implements ITimerComponent {
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (ownerEntity: IEntity) => void

  private onTimeReachedCallback?: () => void

  /**
   * @param millisecs amount of time in milliseconds
   * @param onTimeReachedCallback callback for when time is reached
   */
  constructor(millisecs: number, onTimeReachedCallback?: () => void) {
    TimerSystem.createAndAddToEngine()

    this.elapsedTime = 0
    this.targetTime = millisecs / 1000
    this.onTimeReachedCallback = onTimeReachedCallback
    this.onTargetTimeReached = entity => {
      if (this.onTimeReachedCallback) this.onTimeReachedCallback()
      entity.removeComponent(this)
      engine.removeEntity(entity)
    }
  }

  setCallback(onTimeReachedCallback: () => void) {
    this.onTimeReachedCallback = onTimeReachedCallback
  }
}
