import { ITransformComponent } from '../component/itransformcomponent'

export class TransformSystem implements ISystem {
  public static _instance: TransformSystem | null = null

  private _components: ComponentConstructor<ITransformComponent>[] = []
  private _componentGroups: ComponentGroup[] = []

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

  public addComponentType(
    component: ComponentConstructor<ITransformComponent>
  ) {
    for (let comp of this._components) {
      if (component == comp) {
        return
      }
    }
    this._components.push(component)
    this._componentGroups.push(engine.getComponentGroup(component, Transform))
  }

  private constructor() {
    TransformSystem._instance = this
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
