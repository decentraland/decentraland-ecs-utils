/**
 * Maps a value from one range of values to its equivalent, scaled in proportion to another range of values, using maximum and minimum.
 *
 * @param value input number
 * @param min1 Minimum value in the range of the input.
 * @param max1 Maximum value in the range of the input.
 * @param min2 Minimum value in the range of the output.
 * @param max2 Maximum value in the range of the output.
 *
 */
export function map(
  value: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number
) {
  let range1 = max1 - min1
  let range2 = max2 - min2

  return ((value - min1) / range1) * range2 + min2
}

// constrain
/**
 * Clamps a value so that it doesn't exceed a minimum or a maximum value.
 *
 * @param value input number
 * @param min Minimum output value.
 * @param max Maximum output value.
 *
 */
export function clamp(value: number, min: number, max: number) {
  let result = value

  if (value > max) {
    result = max
  } else if (value < min) {
    result = min
  }
  return result
}

/**
 * Returns the position of an entity that is a child of other entities, relative to the scene instead of relative to the parent. Returns a Vector3.
 *
 * @param entity Entity to calculate position
 *
 */
export function getEntityWorldPosition(entity: IEntity): Vector3 {
  let entityPosition: Vector3 = entity.hasComponent(Transform)
    ? entity.getComponent(Transform).position.clone()
    : Vector3.Zero()
  let parentEntity = entity.getParent()

  if (parentEntity != null) {
    if (parentEntity.uuid == 'FirstPersonCameraEntityReference') {
      //log('ATTACHED TO CAMERA')
      let parentRotation = Camera.instance.rotation.clone()
      return Camera.instance.position
        .clone()
        .add(entityPosition.rotate(parentRotation))
    } else if (parentEntity.uuid == 'AvatarEntityReference') {
      //log('ATTACHED TO AVATAR')
      let camRotation = Camera.instance.rotation
      let parentRotation = Quaternion.Euler(0, camRotation.eulerAngles.y, 0)
      //log(Camera.instance.rotation.eulerAngles.y)
      return Camera.instance.position
        .clone()
        .add(entityPosition.rotate(parentRotation))
        .add(new Vector3(0, -0.875, 0))
    } else {
      let parentRotation = parentEntity.hasComponent(Transform)
        ? parentEntity.getComponent(Transform).rotation
        : Quaternion.Identity
      return getEntityWorldPosition(parentEntity).add(
        entityPosition.rotate(parentRotation)
      )
    }
  }
  return entityPosition
}

/**
 * Returns the position of an entity that is a child of other entities, relative to the scene instead of relative to the parent. Returns a Vector3.
 *
 * @param entity Entity to calculate position
 *
 */
export function getEntityWorldRotation(entity: IEntity): Quaternion {
  let entityRotation: Quaternion = entity.hasComponent(Transform)
    ? entity.getComponent(Transform).rotation.clone()
    : Quaternion.Zero()
  let parentEntity = entity.getParent()
  if (parentEntity != null) {
    if (parentEntity.uuid == 'FirstPersonCameraEntityReference') {
      //log('ATTACHED TO CAMERA')
      let parentRotation = Camera.instance.rotation.clone()
      return entityRotation.multiply(parentRotation)
    } else if (parentEntity.uuid == 'AvatarEntityReference') {
      //log('ATTACHED TO AVATAR')
      let parentRotation = Quaternion.Euler(
        0,
        Camera.instance.rotation.eulerAngles.y,
        0
      )
      return entityRotation.multiply(parentRotation)
    } else {
      let parentRotation = parentEntity.hasComponent(Transform)
        ? parentEntity.getComponent(Transform).rotation
        : Quaternion.Identity
      return entityRotation.multiply(getEntityWorldRotation(parentEntity))
    }
  }
  return entityRotation
}
