import { Delay } from "../timer/component/delay"


/**
 * Quick function to delay the execution of a lambda after a given amount of time.
 *
 * @param {number} ms  Time im milliseconds to delay the function
 * @param {() => void} callback Function to execute when the time is up
 */
export function setTimeout(ms: number, callback: () => void): Entity {
	const entity = new Entity()
	entity.addComponent(
	  new Delay(ms, () => {
		callback()
		engine.removeEntity(entity)
	  })
	)
	engine.addEntity(entity)

	return entity
  }