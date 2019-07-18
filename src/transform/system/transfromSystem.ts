import Components from "../component/index"
import { ITransformComponent } from "../component/itransformcomponent";

export default class TransformSystem implements ISystem {
    private static _instance: TransformSystem | null = null

    private _components: ComponentConstructor<ITransformComponent>[] = []

    static createAndAddToEngine(): TransformSystem{
        if (this._instance == null){
            this._instance = new TransformSystem()
            engine.addSystem(this._instance)
        }
        return this._instance
    }

    static registerCustomComponent<T extends ITransformComponent>(component: ComponentConstructor<T>){
        this.createAndAddToEngine()._components.push(component)
    }

    private constructor(){
        TransformSystem._instance = this
        this._components.push(Components.MoveTransformComponent)
        this._components.push(Components.RotateTransformComponent)
        this._components.push(Components.ScaleTransformComponent)
        this._components.push(Components.FollowPathComponent)
        this._components.push(Components.KeepRotatingComponent)
    }

    update(dt: number){
        this._components.forEach(component => {
            this.updateComponent(dt, component)    
        });
    }

    private updateComponent<T extends ITransformComponent>(dt: number, component: ComponentConstructor<T>){
        const group = engine.getComponentGroup(component, Transform)

        for (let entity of group.entities){
            const transform = entity.getComponent(Transform)
            const comp = entity.getComponent(component)

            comp.update(dt)
            comp.assignValueToTransform(transform)
            if (comp.hasFinished()){
                entity.removeComponent(comp)
                if (comp.onFinishCallback != null) comp.onFinishCallback()
            }
        }
    }
}