namespace Timer{
    export namespace Components{
        export interface ITimerComponent{
            elapsedTime: number
            targetTime: number
            onTargetTimeReached: (ownerEntity: IEntity) => void 
        }
    }
}