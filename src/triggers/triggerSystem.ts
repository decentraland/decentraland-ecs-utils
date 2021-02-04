import { isPreviewMode } from '@decentraland/EnvironmentAPI'

/**
 *
 * @typedef {Object} TriggerData - Object with data for a NPCTriggerComponent
 * @property {number} layer  layer of the Trigger, useful to discriminate between trigger events. You can set multiple layers by using a | symbol.
 * @property {number} triggeredByLayer against which layers to check collisions
 * @property {(entity: Entity) => void } onTriggerEnter callback when an entity of a valid layer enters the trigger area
 * @property {(entity: Entity) => void} onTriggerExit callback when an entity of a valid layer leaves the trigger area
 * @property {() => void} onCameraEnter callback when the player enters the trigger area
 * @property {() => void} onCameraExit callback when the player leaves the trigger area
 * @property {boolean} enableDebug when true makes the trigger area visible for debug purposes.
 */
export type TriggerData = {
  layer?: number
  triggeredByLayer?: number
  onTriggerEnter?: (entity: Entity) => void
  onTriggerExit?: (entity: Entity) => void
  onCameraEnter?: () => void
  onCameraExit?: () => void
  enableDebug?: boolean
}

export class TriggerSystem implements ISystem {
  private static _instance: TriggerSystem | null = null
  static get instance(): TriggerSystem {
    return this.createAndAddToEngine()
  }

  private _triggers: Record<string, TriggerWrapper> = {}
  private _cameraTriggerWrapper: CameraTrigger
  private _componentGroup: ComponentGroup

  private constructor() {
    TriggerSystem._instance = this
    this._cameraTriggerWrapper = new CameraTrigger(
      new TriggerBoxShape(new Vector3(0.5, 1.8, 0.5), new Vector3(0, 0.91, 0))
    )

    this._componentGroup = engine.getComponentGroup(TriggerComponent)
  }

  static createAndAddToEngine(): TriggerSystem {
    if (this._instance == null) {
      this._instance = new TriggerSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  /**
   * set a custom trigger's shape for the camera
   * @param {TriggerBoxShape | TriggerSphereShape} shape custom trigger's shape
   */
  setCameraTriggerShape(shape: TriggerBoxShape | TriggerSphereShape) {
    this._cameraTriggerWrapper.setShape(shape)
  }

  update() {
    let entitiesWithTriggers = this._componentGroup.entities

    //iterate through all entities with triggers and wrap entities that weren't wrapped yet
    entitiesWithTriggers.forEach(entity => {
      if (this.shouldWrapTriggerEntity(entity)) {
        this.wrapTriggerEntity(entity)
      }
    })

    //iterate through wrapped entities
    for (const key in this._triggers) {
      if (this._triggers.hasOwnProperty(key)) {
        let wrapper = this._triggers[key]

        //update debug entity
        if (wrapper.isDebugging()) {
          wrapper.updateDebugEntity()
        }

        if (!wrapper.isInEngine()) {
          //remove debugging
          if (wrapper.isDebugging()) {
            wrapper.removeDebugEntity()
          }
          //remove old collisions
          TriggerSystem.removeTriggerFromSystem(wrapper)
          //remove from record
          delete this._triggers[key]
        } else if (wrapper.trigger != null && wrapper.trigger.enabled) {
          //if was set as enabled in last frame
          if (!wrapper.wasEnabled) {
            if (wrapper.isDebugging()) {
              wrapper.addDebugEntity()
            }
          }
          //set as enabled
          wrapper.wasEnabled = true

          //check collision camera
          if (wrapper.trigger.onCameraEnter || wrapper.trigger.onCameraExit) {
            this.checkCollisionAgainstCamera(wrapper)
          }

          //check collision with others
          if (wrapper.trigger.onTriggerEnter || wrapper.trigger.onTriggerExit) {
            this.checkCollisionAgainstOtherTriggers(wrapper)
          }
        } else if (wrapper.wasEnabled) {
          wrapper.wasEnabled = false
          //remove debugging
          if (wrapper.isDebugging()) {
            wrapper.removeDebugEntity()
          }
          TriggerSystem.removeTriggerFromSystem(wrapper)
        }
      }
    }
  }

  private shouldWrapTriggerEntity(entity: IEntity): boolean {
    return (
      this._triggers[entity.uuid] == undefined ||
      this._triggers[entity.uuid] == null
    )
  }

  private wrapTriggerEntity(entity: IEntity) {
    this._triggers[entity.uuid] = new TriggerWrapper(entity as Entity)
  }

  private static removeTriggerFromSystem(wrapper: TriggerWrapper) {
    let activeCollisions = wrapper.getActiveCollisions()
    for (let i = 0; i < activeCollisions.length; i++) {
      let activeCollisionHasTrigger = !(
        activeCollisions[i] ===
          TriggerSystem._instance?._cameraTriggerWrapper ||
        activeCollisions[i].trigger == null
      )

      if (
        activeCollisionHasTrigger &&
        activeCollisions[i].trigger.onTriggerExit &&
        wrapper.entity
      )
        (activeCollisions[i].trigger.onTriggerExit as (
          entity: IEntity
        ) => void)(wrapper.entity)
      activeCollisions[i].disengageActiveCollision(wrapper)
      wrapper.disengageActiveCollision(activeCollisions[i])
    }
  }

  private static disengageCollision(t1: TriggerWrapper, t2: TriggerWrapper) {
    t1.disengageActiveCollision(t2)
    t2.disengageActiveCollision(t1)

    if (t1.trigger.onTriggerExit && t2.entity)
      t1.trigger.onTriggerExit(t2.entity)
    if (t2.trigger.onTriggerExit && t1.entity)
      t2.trigger.onTriggerExit(t1.entity)
  }

  private static engageCollision(t1: TriggerWrapper, t2: TriggerWrapper) {
    t1.engageCollision(t2)
    t2.engageCollision(t1)

    if (t1.trigger.onTriggerEnter && t2.entity)
      t1.trigger.onTriggerEnter(t2.entity)
    if (t2.trigger.onTriggerEnter && t1.entity)
      t2.trigger.onTriggerEnter(t1.entity)
  }

  private checkCollisionAgainstCamera(wrapper: TriggerWrapper) {
    let wereColliding = wrapper.hasActiveCollision(this._cameraTriggerWrapper)
    let areColliding = TriggerSystem.areColliding(
      wrapper,
      this._cameraTriggerWrapper
    )

    if (wereColliding && !areColliding) {
      wrapper.disengageActiveCollision(this._cameraTriggerWrapper)
      if (wrapper.trigger.onCameraExit) wrapper.trigger.onCameraExit()
    } else if (!wereColliding && areColliding) {
      wrapper.engageCollision(this._cameraTriggerWrapper)
      if (wrapper.trigger.onCameraEnter) wrapper.trigger.onCameraEnter()
    }
  }

  private checkCollisionAgainstOtherTriggers(wrapper: TriggerWrapper) {
    for (const key in this._triggers) {
      if (this._triggers.hasOwnProperty(key)) {
        if (key != wrapper.uuid && this._triggers[key].trigger.enabled) {
          if (TriggerSystem.canTriggersCollide(wrapper, this._triggers[key])) {
            let wereColliding = wrapper.hasActiveCollision(this._triggers[key])
            let areColliding = TriggerSystem.areColliding(
              wrapper,
              this._triggers[key]
            )

            if (wereColliding && !areColliding)
              TriggerSystem.disengageCollision(wrapper, this._triggers[key])
            else if (!wereColliding && areColliding)
              TriggerSystem.engageCollision(wrapper, this._triggers[key])
          }
        }
      }
    }
  }

  private static canTriggersCollide(
    t1: TriggerWrapper,
    t2: TriggerWrapper
  ): boolean {
    if (t1.trigger.triggeredByLayer == 0) return true
    return (t2.trigger.layer & t1.trigger.triggeredByLayer) != 0
  }

  private static areColliding(t1: TriggerWrapper, t2: TriggerWrapper): boolean {
    if (
      t1.getShape() instanceof TriggerBoxShape &&
      t2.getShape() instanceof TriggerBoxShape
    ) {
      return TriggerSystem.areCollidingAABB(
        t1.getGlobalPosition(),
        t1.getShape() as TriggerBoxShape,
        t2.getGlobalPosition(),
        t2.getShape() as TriggerBoxShape
      )
    } else if (
      t1.getShape() instanceof TriggerSphereShape &&
      t2.getShape() instanceof TriggerSphereShape
    ) {
      return TriggerSystem.areCollidingSphere(
        t1.getGlobalPosition(),
        t1.getShape() as TriggerSphereShape,
        t2.getGlobalPosition(),
        t2.getShape() as TriggerSphereShape
      )
    } else if (
      t1.getShape() instanceof TriggerBoxShape &&
      t2.getShape() instanceof TriggerSphereShape
    ) {
      return TriggerSystem.areCollidingAABBSphere(
        t1.getGlobalPosition(),
        t1.getShape() as TriggerBoxShape,
        t2.getGlobalPosition(),
        t2.getShape() as TriggerSphereShape
      )
    } else if (
      t1.getShape() instanceof TriggerSphereShape &&
      t2.getShape() instanceof TriggerBoxShape
    ) {
      return TriggerSystem.areCollidingAABBSphere(
        t2.getGlobalPosition(),
        t2.getShape() as TriggerBoxShape,
        t1.getGlobalPosition(),
        t1.getShape() as TriggerSphereShape
      )
    }
    return false
  }

  private static areCollidingAABB(
    t1GlobalPosition: Vector3,
    t1Shape: TriggerBoxShape,
    t2GlobalPosition: Vector3,
    t2Shape: TriggerBoxShape
  ): boolean {
    let t1 = TriggerSystem.getBoxShapeValues(t1GlobalPosition, t1Shape)
    let t2 = TriggerSystem.getBoxShapeValues(t2GlobalPosition, t2Shape)
    return (
      t1.min.x <= t2.max.x &&
      t1.max.x >= t2.min.x &&
      t1.min.y <= t2.max.y &&
      t1.max.y >= t2.min.y &&
      t1.min.z <= t2.max.z &&
      t1.max.z >= t2.min.z
    )
  }

  private static areCollidingSphere(
    t1GlobalPosition: Vector3,
    t1Shape: TriggerSphereShape,
    t2GlobalPosition: Vector3,
    t2Shape: TriggerSphereShape
  ): boolean {
    let sqDist = Vector3.DistanceSquared(
      t1GlobalPosition.add(t1Shape.position),
      t2GlobalPosition.add(t2Shape.position)
    )
    return (
      sqDist < t1Shape.radius * t1Shape.radius + t2Shape.radius * t2Shape.radius
    )
  }

  private static areCollidingAABBSphere(
    t1GlobalPosition: Vector3,
    t1Shape: TriggerBoxShape,
    t2GlobalPosition: Vector3,
    t2Shape: TriggerSphereShape
  ): boolean {
    let box = TriggerSystem.getBoxShapeValues(t1GlobalPosition, t1Shape)
    let sphere = {
      center: t2GlobalPosition.add(t2Shape.position),
      radius: t2Shape.radius
    }

    let dmin = 0
    if (sphere.center.x < box.min.x)
      dmin += (box.min.x - sphere.center.x) * (box.min.x - sphere.center.x)
    if (sphere.center.x > box.max.x)
      dmin += (sphere.center.x - box.max.x) * (sphere.center.x - box.max.x)
    if (sphere.center.y < box.min.y)
      dmin += (box.min.y - sphere.center.y) * (box.min.y - sphere.center.y)
    if (sphere.center.y > box.max.y)
      dmin += (sphere.center.y - box.max.y) * (sphere.center.y - box.max.y)
    if (sphere.center.z < box.min.z)
      dmin += (box.min.z - sphere.center.z) * (box.min.z - sphere.center.z)
    if (sphere.center.z > box.max.z)
      dmin += (sphere.center.z - box.max.z) * (sphere.center.z - box.max.z)

    return dmin < sphere.radius * sphere.radius
  }

  private static getBoxShapeValues(
    entityGlobalPosition: Vector3,
    shape: TriggerBoxShape
  ): { center: Vector3; min: Vector3; max: Vector3 } {
    let center = entityGlobalPosition.add(shape.position)
    return {
      center: center,
      min: center.subtract(shape.size.scale(0.5)),
      max: center.add(shape.size.scale(0.5))
    }
  }
}

class TriggerWrapper {
  wasEnabled: boolean = true

  get entity(): Entity | undefined {
    return this._entity
  }
  get trigger(): TriggerComponent {
    return this._trigger
  }
  get uuid(): string {
    return this._uuid
  }

  protected _entity?: Entity
  protected _trigger!: TriggerComponent
  protected _uuid: string = ''
  protected _collidingWith: Record<string, TriggerWrapper> = {}

  private _isDebug: boolean = false
  private _debugEntity: Entity | null = null
  private static _debugMaterial: Material | null = null

  constructor(entity?: Entity) {
    this._entity = entity
    if (entity) {
      this._trigger = entity.getComponent(TriggerComponent)
      this._uuid = entity.uuid
      this._isDebug = this._trigger.debugEnabled
      if (this._isDebug) {
        this.addDebugEntity()
      }
    }
  }

  getGlobalPosition(): Vector3 {
    if (this._entity) return TriggerWrapper.getEntityWorldPosition(this._entity)
    return Vector3.Zero()
  }

  getShape(): TriggerBoxShape | TriggerSphereShape {
    return this._trigger.shape
  }

  isInEngine(): boolean {
    return this._entity != null && this._entity.isAddedToEngine()
  }

  getActiveCollisions(): TriggerWrapper[] {
    let ret: TriggerWrapper[] = []

    for (const key in this._collidingWith) {
      if (this._collidingWith.hasOwnProperty(key)) {
        ret.push(this._collidingWith[key])
      }
    }
    return ret
  }

  hasActiveCollision(other: TriggerWrapper): boolean {
    return (
      this._collidingWith[other.uuid] != undefined &&
      this._collidingWith[other.uuid] != null
    )
  }

  disengageActiveCollision(other: TriggerWrapper) {
    delete this._collidingWith[other.uuid]
  }

  engageCollision(other: TriggerWrapper) {
    this._collidingWith[other.uuid] = other
  }

  isDebugging(): boolean {
    return this._isDebug
  }

  async addDebugEntity() {
    if (await !isPreviewMode()) {
      return
    }

    if (!TriggerWrapper._debugMaterial) {
      TriggerWrapper._debugMaterial = new Material()
      TriggerWrapper._debugMaterial.alphaTest = 0.5
    }

    if (this._debugEntity == null) {
      this._debugEntity = new Entity()

      const transform = new Transform()
      this._debugEntity.addComponent(transform)
      this._debugEntity.addComponent(TriggerWrapper._debugMaterial)

      if (this.getShape() instanceof TriggerBoxShape) {
        const shape = new BoxShape()
        shape.withCollisions = false
        this._debugEntity.addComponent(shape)
        transform.scale = (this.getShape() as TriggerBoxShape).size
      }
      if (this.getShape() instanceof TriggerSphereShape) {
        const shape = new SphereShape()
        shape.withCollisions = false
        this._debugEntity.addComponent(shape)
        let rad = (this.getShape() as TriggerSphereShape).radius
        transform.scale = new Vector3(rad, rad, rad)
      }
    }
    engine.addEntity(this._debugEntity)
  }

  removeDebugEntity() {
    if (this._debugEntity != null) engine.removeEntity(this._debugEntity)
  }

  updateDebugEntity() {
    if (this._debugEntity) {
      this._debugEntity.getComponent(
        Transform
      ).position = this.getGlobalPosition().add(this.getShape().position)
    }
  }

  private static getEntityWorldPosition(entity: IEntity): Vector3 {
    let entityPosition = entity.hasComponent(Transform)
      ? entity.getComponent(Transform).position.clone()
      : Vector3.Zero()
    let parentEntity = entity.getParent()

    if (parentEntity != null) {
      let parentRotation = parentEntity.hasComponent(Transform)
        ? parentEntity.getComponent(Transform).rotation
        : Quaternion.Identity
      return this.getEntityWorldPosition(parentEntity).add(
        entityPosition.rotate(parentRotation)
      )
    }
    return entityPosition
  }
}

class CameraTrigger extends TriggerWrapper {
  private _shape: TriggerBoxShape | TriggerSphereShape

  constructor(shape: TriggerBoxShape | TriggerSphereShape) {
    super()
    this._shape = shape
    this._uuid = 'cameraTrigger'
  }

  getGlobalPosition() {
    return Camera.instance.position
  }

  getShape() {
    return this._shape
  }

  setShape(shape: TriggerBoxShape | TriggerSphereShape) {
    this._shape = shape
  }

  isInEngine(): boolean {
    return false
  }

  hasActiveCollision(other: TriggerWrapper): boolean {
    return false
  }

  disengageActiveCollision(other: TriggerWrapper) {}

  engageCollision(other: TriggerWrapper) {}
  isDebugging(): boolean {
    return false
  }
}

@Component('triggerComponent')
export class TriggerComponent {
  /**
   * Is the trigger enabled? If false, the associated functions aren't triggered.
   */
  enabled: boolean = true
  /**
   * shape of the collider
   */
  shape: TriggerBoxShape | TriggerSphereShape
  /**
   * bit layer of the Tigger (usefull to discriminate between trigger events)
   */
  layer: number = 0
  /**
   * against which layer are we going to check trigger's collisions
   */
  triggeredByLayer: number = 0
  /**
   * callback when trigger is entered
   */
  onTriggerEnter?: (entity: Entity) => void
  /**
   * callback when trigger is exit
   */
  onTriggerExit?: (entity: Entity) => void
  /**
   * callback when trigger is entered
   */
  onCameraEnter?: () => void
  /**
   * callback when trigger is exit
   */
  onCameraExit?: () => void
  /**
   * get if debug is enabled
   */
  get debugEnabled(): boolean {
    return this._debugEnabled
  }

  private _debugEnabled: boolean = false

  /**
   *
   * @param {TriggerBoxShape | TriggerSphereShape} shape shape of the triggering collider area
   * @param {TriggerData} data An object with additional parameters for the trigger component
   */
  constructor(shape: TriggerBoxShape | TriggerSphereShape, data?: TriggerData) {
    TriggerSystem.createAndAddToEngine()
    this.shape = shape
    if (data) {
      if (data.layer) this.layer = data.layer
      if (data.triggeredByLayer) this.triggeredByLayer = data.triggeredByLayer
      if (data.onTriggerEnter) this.onTriggerEnter = data.onTriggerEnter
      if (data.onTriggerExit) this.onTriggerExit = data.onTriggerExit
      if (data.onCameraEnter) this.onCameraEnter = data.onCameraEnter
      if (data.onCameraExit) this.onCameraExit = data.onCameraExit
      if (data.enableDebug) this._debugEnabled = data.enableDebug
    }
  }
}

/**
 * Define a box-shaped area for using on a TriggerComponent
 * @param {Vector3} [size=2] The scale of the box area. By default 2x2x2
 * @param {Vector3} [position=Vector3.Zero()] The offset from the position of the entity that owns the TriggerComponent
 */
export class TriggerBoxShape {
  size: Vector3
  position: Vector3

  constructor(size?: Vector3, position?: Vector3) {
    this.size = size ? size : Vector3.One().scale(2)
    this.position = position ? position : Vector3.Zero()
  }
}

/**
 * Define a sphere-shaped area for using on a TriggerComponent
 * @param {number} [radius=2] The radius of the sphere area. By default 2
 * @param {Vector3} [position=Vector3.Zero()] The offset from the position of the entity that owns the TriggerComponent
 */
export class TriggerSphereShape {
  radius: number
  position: Vector3

  constructor(radius?: number, position?: Vector3) {
    this.radius = radius ? radius : 2
    this.position = position ? position : Vector3.Zero()
  }
}
