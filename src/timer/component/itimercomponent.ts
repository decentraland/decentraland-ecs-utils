/**
 * @public
 */
export interface ITimerComponent {
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (ownerEntity: IEntity) => void
}
