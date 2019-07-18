import { ITransformComponent } from "../component/itransformcomponent";
import { MoveTransformComponent } from "../component/move";
import { RotateTransformComponent } from "../component/rotate";
import { ScaleTransformComponent } from "../component/scale";
import { FollowPathComponent } from "../component/followpath";
import { KeepRotatingComponent } from "../component/keeprotating";

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
        this._components.push(MoveTransformComponent)
        this._components.push(RotateTransformComponent)
        this._components.push(ScaleTransformComponent)
        this._components.push(FollowPathComponent)
        this._components.push(KeepRotatingComponent)
    }

    update(dt: number){
        this._components.forEach(component => {
            this.updateComponent(dt, component)    
        });
    }

    private updateComponent<T extends ITransformComponent>(dt: number, component: ComponentConstructor<T>){
        const group = engine.getComponentGroup(component, Transform)

        group.entities.forEach(entity => {
            const transform = entity.getComponent(Transform)
            const comp = entity.getComponent(component)

            comp.update(dt)
            comp.assignValueToTransform(transform)
            if (comp.hasFinished()){
                entity.removeComponent(comp)
                if (comp.onFinishCallback != null) comp.onFinishCallback()
            }
        });
    }
}