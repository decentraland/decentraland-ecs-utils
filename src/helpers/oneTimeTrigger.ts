import { TriggerBoxShape, TriggerComponent, TriggerData, TriggerSphereShape } from "../triggers/triggerSystem"


/**
 * Quick function to add a trigger area that is removed after being triggered once.
 * @public
 * 
 * @param shape - shape of the triggering collider area
 * @param data - An object with additional parameters for the trigger component
 * @param parent - Optional entity to set as a parent to the trigger area entity.
 */
 export function addOneTimeTrigger(
	shape: TriggerBoxShape | TriggerSphereShape, 
	data?: TriggerData,
	parent?: Entity
  ): Entity {
	let entered = false
	let exited = false
  
	const trigger = new Entity()
	trigger.addComponent(new Transform({}))
  
	let triggerData: TriggerData = {}

	if (data.layer) triggerData.layer = data.layer
      if (data.triggeredByLayer) triggerData.triggeredByLayer = data.triggeredByLayer
      if (data.onCameraEnter) triggerData.onCameraEnter = () => {
		if (!entered) {
		  entered = true
		  data.onCameraEnter()
		}
		if ((entered || !data.onCameraEnter) && (exited || !data.onCameraExit)) {
		  engine.removeEntity(trigger)
		}
	  }
      if (data.onCameraExit) triggerData.onCameraExit = () => {
		if (!exited) {
			exited = true
		  data.onCameraExit()
		}
		if ((entered || !data.onCameraEnter) && (exited || !data.onCameraExit)) {
		  engine.removeEntity(trigger)
		}
	  }
      if (data.enableDebug) triggerData.enableDebug = data.enableDebug


	trigger.addComponent(
	  new TriggerComponent(
		shape,
		triggerData
	  )
	)
  
	if (parent) {
	  trigger.setParent(parent)
	}
	engine.addEntity(trigger)

	return trigger
  }