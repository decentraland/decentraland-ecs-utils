import { ITransformComponent } from '../component/itransformcomponent'
import { MoveTransformComponent } from '../component/move'
import { RotateTransformComponent } from '../component/rotate'
import { ScaleTransformComponent } from '../component/scale'
import { FollowPathComponent } from '../component/followpath'
import { KeepRotatingComponent } from '../component/keeprotating'

export class TransformSystem implements ISystem {
  private static _instance: TransformSystem | null = null

  private _components: ComponentConstructor<ITransformComponent>[] = []
  private _componentGroups = []

  static createAndAddToEngine(): TransformSystem {
    if (this._instance == null) {
      this._instance = new TransformSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  static registerCustomComponent<T extends ITransformComponent>(
    component: ComponentConstructor<T>
  ) {
    this.createAndAddToEngine()._components.push(component)
  }

  private constructor() {
    TransformSystem._instance = this
    this._components.push(MoveTransformComponent)
    this._componentGroups.push(
      engine.getComponentGroup(MoveTransformComponent, Transform)
    )

    this._components.push(RotateTransformComponent)
    this._componentGroups.push(
      engine.getComponentGroup(RotateTransformComponent, Transform)
    )

    this._components.push(ScaleTransformComponent)
    this._componentGroups.push(
      engine.getComponentGroup(ScaleTransformComponent, Transform)
    )

    this._components.push(FollowPathComponent)
    this._componentGroups.push(
      engine.getComponentGroup(FollowPathComponent, Transform)
    )

    this._components.push(FollowCurvedPathComponent)
    this._componentGroups.push(
      engine.getComponentGroup(FollowCurvedPathComponent, Transform)
    )

    this._components.push(KeepRotatingComponent)
    this._componentGroups.push(
      engine.getComponentGroup(KeepRotatingComponent, Transform)
    )
  }

  update(dt: number) {
    for (let i = 0; i < this._components.length; i++) {
      this.updateComponent(dt, this._components[i], this._componentGroups[i])
    }
  }

  private updateComponent<T extends ITransformComponent>(
    dt: number,
    component: ComponentConstructor<T>,
    group: ComponentGroup
  ) {
    group.entities.forEach(entity => {
      const transform = entity.getComponent(Transform)
      const comp = entity.getComponent(component)

      comp.update(dt)
      comp.assignValueToTransform(transform)
      if (comp.hasFinished()) {
        entity.removeComponent(comp)
        if (comp.onFinishCallback != null) comp.onFinishCallback()
      }
    })
  }
}
