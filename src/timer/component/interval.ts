/// <reference path="./itimercomponent.ts" />
/// <reference path="../system/timerSystem.ts" />

namespace Timer{
    export namespace Components{
        /**
         * Execute every X milliseconds
         */
        @Component("timerInterval")
        export class Interval implements ITimerComponent{
            elapsedTime: number;
            targetTime: number;
            onTargetTimeReached: (ownerEntity: IEntity) => void;

            private onTimeReachedCallback?: ()=> void

            /**
             * @param millisecs amount of time in milliseconds
             * @param onTimeReachedCallback callback for when time is reached
             */
            constructor(millisecs: number, onTimeReachedCallback?: ()=> void){
                TimerSystem.createAndAddToEngine()

                this.elapsedTime = 0
                this.targetTime = millisecs / 1000
                this.onTimeReachedCallback = onTimeReachedCallback
                this.onTargetTimeReached = ()=>{
                    this.elapsedTime = 0
                    if (this.onTimeReachedCallback) this.onTimeReachedCallback()
                }
            }

            setCallback(onTimeReachedCallback: ()=> void){
                this.onTimeReachedCallback = onTimeReachedCallback
            }

        }
    }
}