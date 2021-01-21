import { isPreviewMode } from '@decentraland/EnvironmentAPI'

/**
 * Quick function to add a cube that can run functions when clicked. By default only displayed when in preview mode for tests.
 *
 * @param {TranformConstructorArgs} pos Transform arguments for the cube, including position, scale and rotation
 * @param {() => void} triggeredFunction Function to execute every time the cube is clicked.
 * @param {string} label Text to display over cube and on hover.
 * @param {Color3} color Cube color.
 * @param {boolean} sphere If true, use a sphere shape instead of cube.
 * @param {boolean} noCollider If true, cube has no collider.
 * @return {Entity} A new entity with the configured settings and a label as a child
 *
 */
export async function addTestCube(
  pos: TranformConstructorArgs,
  triggeredFunction: () => void,
  label?: string,
  color?: Color3,
  sphere?: boolean,
  noCollider?: boolean,
  keepInProduction?: boolean
) {
  // if not in preview return
  if (!keepInProduction && (await !isPreviewMode())) {
    return
  }

  let cube = new Entity()
  cube.addComponent(new Transform(pos))
  if (sphere) {
    cube.addComponent(new SphereShape())
    cube.getComponent(Transform).scale.setAll(0.5)
  } else {
    cube.addComponent(new BoxShape())
  }

  engine.addEntity(cube)

  cube.addComponent(
    new OnPointerDown(triggeredFunction, {
      hoverText: label ? label : 'click',
      button: ActionButton.POINTER
    })
  )

  if (color) {
    let cubeMaterial = new Material()
    cubeMaterial.albedoColor = color
    cube.addComponent(cubeMaterial)
  }

  if (noCollider) {
    cube.getComponent(BoxShape).withCollisions = false
  }

  if (label) {
    addLabel(label, cube, true)
  }

  return cube
}

/**
 * Maps a value from one range of values to its equivalent, scaled in proportion to another range of values, using maximum and minimum.
 *
 * @param {string} text Text to use on label
 * @param {Entity} parent Entity to place label on.
 * @param {boolean} billboard If true, label turns to always face player.
 * @param {Color3} color Text color. Black by default.
 * @param {number} size Text font size, 3 by default.
 * @param {TranformConstructorArgs} textOffset Offset from parent entity's position. By default 1.5 meters above the parent.
 * @return {Entity} A new entity with the configured settings that is a child of the provided parent
 *
 */
export function addLabel(
  text: string,
  parent: IEntity,
  billboard?: boolean,
  color?: Color3,
  size?: number,
  textOffset?: TranformConstructorArgs
) {
  let label = new Entity()
  label.addComponent(
    new Transform(
      textOffset ? textOffset : { position: new Vector3(0, 1.5, 0) }
    )
  )
  label.setParent(parent)
  let textShape = new TextShape(text)
  textShape.fontSize = size ? size : 3
  textShape.color = color ? color : Color3.Black()
  label.addComponent(textShape)
  if (billboard) {
    label.addComponent(new Billboard())
  }
  engine.addEntity(label)

  return label
}
