# decentraland-ecs-utils

This library includes a number of helpful pre-built tools that include components, methods, and systems. They offer simple solutions to common scenarios that you're likely to run into.

- [Gradual Movement](#gradual-movement)
	- [Move an entity](#move-an-entity)
	- [Follow a path](#follow-a-path)
	- [Rotate an entity](#rotate-an-entity)
	- [Change scale](#change-scale)
	- [Non-linear changes](#non-linear-changes)
	- [Callback on finish](#callback-on-finish)
- [Toggle](#toggle)
- [Time](#time)
	- [Delay a function](#delay-a-function)
	- [Delay removing an entity](#delay-removing-an-entity)
	- [Repeat at an Interval](#repeat-at-an-interval)

## Using the Utils library

To use any of the helpers provided by the utils library

1. Install it as an `npm` package. Run this command in your scene's project folder:

```
npm install decentraland-ecs-utils
```

2. Import the library into the scene's script. Add this line at the start of your `game.ts` file, or any other TypeScript files that require it:

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"
```

3. In your TypeScript file, write `utils.` and let the suggestions of your IDE show the available helpers.


## Gradual Movement

### Move an entity

To move an entity over a period of time, from one position to another, use the `MoveTransformComponent` component.

`MoveTransformComponent` has three required arguments:

- `start`: `Vector3` for the start position
- `end`: `Vector3` for the end position
- `duration`: duration (in seconds) of the translation

This example moves an entity from one position to another over 2 seconds:

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// Create entity
const box = new Entity()

// Give entity a shape and transform
box.addComponent(new BoxShape())
box.addComponent(new Transform())

//Define start and end positions
let StartPos = new Vector3(1, 1, 1)
let EndPos = new Vector3(15, 1, 15)

// Move entity
box.addComponent(new utils.MoveTransformComponent(StartPos, EndPos, 2))

// Add entity to engine
engine.addEntity(box)
```



### Follow a path

To move an entity over several points of a path over a period of time, use the `FollowPathComponent` component.

`FollowPathComponent` has two required arguments:

- `points`: An array of `Vector3` positions that form the path.
- `duration`: The duration (in seconds) of each segment in the path.
// TODO of the segments of the whole path?

This example moves an entity over through four points:

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// Create entity
const box = new Entity()

// Give entity a shape and transform
box.addComponent(new BoxShape())
box.addComponent(new Transform())

//Define the positions of the path
let path = []
path[0] = new Vector3(1, 1, 1)
path[1] = new Vector3(1, 1, 15)
path[2] = new Vector3(15, 1, 15)
path[3] = new Vector3(15, 1, 1)

// Move entity
box.addComponent(new utils.FollowPathComponent(path, 2))

// Add entity to engine
engine.addEntity(box)
```


### Rotate an entity

To rotate an entity over a period of time, from one direction to another, use the `rotateTransformComponent` component, which works very similarly to the `MoveTransformComponent` component.

`rotateTransformComponent` has three required arguments:

- `start`: `Quaternion` for the start rotation
- `end`: `Quaternion` for the end rotation
- `duration`: duration (in seconds) of the rotation

This example rotates an entity from one rotation to another over 2 seconds:

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// Create entity
const box = new Entity()

// Give entity a shape and transform
box.addComponent(new BoxShape())
box.addComponent(new Transform())

//Define start and end directions
let StartRot = Quaternion.Euler(90, 0, 0)
let EndRot =  Quaternion.Euler(270, 0, 0)

// Rotate entity
box.addComponent(new utils.RotateTransformComponent(StartRot, EndRot, 2))

// Add entity to engine
engine.addEntity(box)
```


<!--
### KeepRotatingComponent

KeepRotatingComponent

TODO: Understand purpose
-->

### Change scale

To adjust the scale of an entity over a period of time, from one size to another, use the `ScaleTransformComponent` component, which works very similarly to the `MoveTransformComponent` component.

`ScaleTransformComponent` has three required arguments:

- `start`: `Vector3` for the start scale
- `end`: `Vector3` for the end scale
- `duration`: duration (in seconds) of the scaling

This example scales an entity from one size to another over 2 seconds:

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// Create entity
const box = new Entity()

// Give entity a shape and transform
box.addComponent(new BoxShape())
box.addComponent(new Transform())

//Define start and end positions
let StartSize = new Vector3(1, 1, 1)
let EndSize = new Vector3(0.75, 2, 0.75)

// Move entity
box.addComponent(new utils.ScaleTransformComponent(StartSize, EndSize, 2))

// Add entity to engine
engine.addEntity(box)
```


### Non-linear changes

All of the translation components, the `MoveTransformComponent`, `rotateTransformComponent`, `ScaleTransformComponent`, and `FollowPathComponent` have an optional argument to set the rate of change. By default, the movement, rotation, or scaling occurs at a linear rate, but this can be set to other options.

The following values are accepted:

- `Interpolation.LINEAR`
- `Interpolation.EASEINQUAD`
- `Interpolation.EASEOUTQUAD`
- `Interpolation.EASEQUAD`

The following example moves a box following an ease-in rate:

```ts
box.addComponent(new utils.MoveTransformComponent(StartPos, EndPos, 2, null, utils.InterpolationType.EASEINQUAD))
```


### Callback on finish


All of the translation components, the `MoveTransformComponent`, `rotateTransformComponent`, `ScaleTransformComponent`, and `FollowPathComponent` have an optional argument that executes a function when the translation is complete.

- `onFinishCallback`: function to execute when movement is done.


The following example logs a message when the box finishes its movement. The example uses `MoveTransformComponent`, but the same applies to `rotateTransformComponent` and `ScaleTransformComponent`.

```ts
box.addComponent(new utils.MoveTransformComponent(StartPos, EndPos, 2, () => {
	log("finished moving box")
}))
```


The `FollowPathComponent` has a two optional arguments that execute functions when a section of the path is complete and when the whole path is complete.

- `onFinishCallback`: function to execute when movement is complete.

- `onPointReachedCallback`: function to execute when each section of the path is done.

The following example logs a messages when the box finishes each segment of the path, and another when the entire path is done.

```ts
box.addComponent(new utils.FollowPathComponent(path, 2,  
	() => {
		log("finished moving box")
	},
	() => {
		log("finished a segment of the path")
	}
))
```


## Toggle

Use the `ToggleComponent` to switch an entity between two possible states, running a same function on every transition.

The `ToggleComponent` has the following arguments:

- `startingState`: Starting state of the toggle (ON or OFF)
- `onValueChangedCallback`: Function to call every time the toggle state changed.

It exposes three methods:

- `toggle()`: switches the state of the component between ON and OFF
- `isOn()`: reads the current state of the component, without altering it. It returns a boolean, where `true` means ON.
- `setCallback()`: allows you to change the function to be executed by `onValueChangedCallback`, for the next time it's toggled.


The following example switches the color of a box between two colors each time it's clicked.

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// Create entity
const box = new Entity()

// Give entity a shape and transform
box.addComponent(new BoxShape())
box.addComponent(new Transform())

//Define two different materials
let greenMaterial = new Material()
greenMaterial.albedoColor = Color3.Green()
let redMaterial = new Material()
redMaterial.albedoColor = Color3.Red()

// Add a Toggle component
box.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
	if (value == utils.ToggleState.On){
		//set color to green
		box.addComponentOrReplace(greenMaterial)
	}
	else{
		//set color to red
		box.addComponentOrReplace(redMaterial)
	}
}))


//listen for click on the box and toggle it's state
box.addComponent(new OnClick(event=>{
	box.getComponent(utils.ToggleComponent).toggle()
}))

// Add entity to engine
engine.addEntity(box)
```

### Combine Toggle with Translate

This example combines a toggle component with a move component to switch an entity between two positions every time it's clicked.

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// Create entity
const box = new Entity()

// Give entity a shape and transform
box.addComponent(new BoxShape())
box.addComponent(new Transform())

//Define two positions for toggling
let Pos1 = new Vector3(1, 1, 1)
let Pos2 = new Vector3(1, 1, 2)

//toggle for wine bottle
box.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
	if (value == utils.ToggleState.On){
		box.addComponentOrReplace(new utils.MoveTransformComponent(Pos1,Pos2, 0.5))
	}
	else{
		box.addComponentOrReplace(new utils.MoveTransformComponent(Pos2,Pos1, 0.5))
	}
}))

//listen for click on the box and toggle it's state
box.addComponent(new OnClick(event=>{
	box.getComponent(utils.ToggleComponent).toggle()
}))

// Add entity to engine
engine.addEntity(box)
```

## Time

These tools are all related to the passage of time in the scene.

### Delay a function

Add a `Delay` component to an entity to execute a function only after an `n` amount of milliseconds.

This example creates an entity that only becomes visible in the scene after 100000 milliseconds (100 seconds) have passed.

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// create entity
const easterEgg = new Entity()

// give entity a shape and set invisible
const easterEggShape = new BoxShape()
easterEggShape.visible = false
easterEgg.addComponent(easterEggShape)

// add a delayed function
easterEgg.addComponent(new utils.Delay(100000, () => {
	easterEgg.getComponent(BoxShape).visible = true
}))

// add entity to scene
engine.addEntity(easterEgg)
```

To delay the execution of a task that isn't directly tied to any entity in the scene, create a dummy entity that only holds a `Delay` component.

### Delay removing an entity

Add an `ExpireIn` component to an entity to remove it from the scene after an `n` amount of milliseconds.

This example creates an entity that is removed from the scene 500 milliseconds after it's clicked.

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// create entity
const box = new Entity()

// give entity a shape
box.addComponent(new BoxShape())

// add a function to run when clicked
box.addComponent(new OnClick(() => {
	box.addComponent(new utils.ExpireIn(500))
}))

// add entity to scene
engine.addEntity(box)
```

### Repeat at an Interval

Add an `Interval` component to an entity to make it execute a same function every `n` milliseconds.

This example creates an entity that changes its scale to a random size every 500 milliseconds.

```ts
import utils from "../node_modules/decentraland-ecs-utils/index"

// create entity
const box = new Entity()

// give entity a shape and transform
box.addComponent(new BoxShape())
box.addComponent(new Transform())

// add a repeated function
box.addComponent(new utils.Interval(500, () => {
	let randomSize = Math.random()
	box.getComponent(Transform).scale.setAll(randomSize)
}))

// add entity to scene
engine.addEntity(box)
```

To repeat the execution of a task that isn't directly tied to any entity in the scene, create a dummy entity that only holds an `Interval` component.
