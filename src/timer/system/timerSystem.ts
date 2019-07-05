/// <reference path="../component/itimercomponent.ts" />

namespace Timer{
    export class TimerSystem implements ISystem {
        
        private static _instance: TimerSystem | null = null

        private _components: ComponentConstructor<Components.ITimerComponent>[] = []

        static createAndAddToEngine(): TimerSystem{
            if (this._instance == null){
                this._instance = new TimerSystem()
                engine.addSystem(this._instance)
            }
            return this._instance
        }

        static registerCustomComponent<T extends Components.ITimerComponent>(component: ComponentConstructor<T>){
            this.createAndAddToEngine()._components.push(component)
        }
        
        private constructor(){
            TimerSystem._instance = this
            this._components.push(Components.Interval)
            this._components.push(Components.Delay)
            this._components.push(Components.ExpireIn)
        }

        update(dt: number){
            this._components.forEach(component => {
                this.updateComponent(dt, component)    
            });
        }

        private updateComponent<T extends Components.ITimerComponent>(dt: number, component: ComponentConstructor<T>){
            let record = engine.getEntitiesWithComponent(component)

            for (const key in record) {
                if (record.hasOwnProperty(key)) {
                    let entity = record[key];
                    let timerComponent = entity.getComponent(component)

                    timerComponent.elapsedTime += dt
                    if (timerComponent.elapsedTime >= timerComponent.targetTime){
                        timerComponent.onTargetTimeReached(entity)
                    }

                }
            }
        }
    }
}