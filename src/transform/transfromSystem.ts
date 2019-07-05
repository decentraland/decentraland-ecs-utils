export class TransformSystem implements ISystem {
    private static _instance: TransformSystem | null = null

    private _components: ComponentConstructor<Components.ITransformComponent>[] = []

    static createAndAddToEngine(): TransformSystem{
        if (this._instance == null){
            this._instance = new TransformSystem()
            engine.addSystem(this._instance)
        }
        return this._instance
    }

    static registerCustomComponent<T extends Components.ITransformComponent>(component: ComponentConstructor<T>){
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

    private updateComponent<T extends Components.ITransformComponent>(dt: number, component: ComponentConstructor<T>){
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

export namespace TransformSystem{
    export enum Interpolation{
        LINEAR,
        EASEINQUAD,
        EASEOUTQUAD,
        EASEQUAD
    }

    export function Interpolate(type: Interpolation, t: number) : number{
        switch(type){
            case Interpolation.LINEAR:
                return InterpolateLinear(t)
            case Interpolation.EASEINQUAD:
                return InterpolateEaseInQuad(t)
            case Interpolation.EASEOUTQUAD:
                return InterpolateEaseOutQuad(t)
            case Interpolation.EASEQUAD:
                return InterpolateEaseQuad(t)
            default:
                return InterpolateLinear(t)
        }
    }
    function InterpolateLinear(t: number) : number{
        return t
    }
    function InterpolateEaseInQuad(t: number) : number{
        return t*t
    }
    function InterpolateEaseOutQuad(t: number) : number{
        return t*(2-t)
    }
    function InterpolateEaseQuad(t: number) : number{
        return (t*t) / (2.0 * ((t*t) - t) + 1.0)
    }
}

namespace Components{
    export interface ITransformComponent{
        onFinishCallback? : ()=>void
        update(dt: number): void
        hasFinished(): boolean
        assignValueToTransform(transform: Transform): void
    }

    /**
     * Component to translate entity from one position (start) to another (end) in an amount of time
     */
    @Component("moveTransformComponent")
    export class MoveTransformComponent implements ITransformComponent{
        private start: ReadOnlyVector3
        private end: ReadOnlyVector3
        private speed: number
        private normalizedTime: number
        private interpolationType: TransformSystem.Interpolation
        private lerpTime : number

        onFinishCallback? : ()=>void

        /**
         * Create a MoveTransformComponent instance to add as a component to a Entity
         * @param start starting position
         * @param end ending position
         * @param duration duration (in seconds) of start to end translation
         * @param onFinishCallback called when translation ends
         * @param interpolationType type of interpolation to be used (default: LINEAR)
         */
        constructor(start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void, interpolationType: TransformSystem.Interpolation = TransformSystem.Interpolation.LINEAR){
            this.start = start
            this.end = end
            this.normalizedTime = 0;
            this.lerpTime = 0;
            this.onFinishCallback = onFinishCallback
            this.interpolationType = interpolationType

            if (duration != 0){
                this.speed = 1 / duration
            }
            else{
                this.speed = 0
                this.normalizedTime = 1;
                this.lerpTime = 1;
            }

            TransformSystem.createAndAddToEngine()
        }

        update(dt: number){
            this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
            this.lerpTime = TransformSystem.Interpolate(this.interpolationType, this.normalizedTime)
        }

        hasFinished(): boolean{
            return this.normalizedTime >= 1
        }

        assignValueToTransform(transform: Transform){
            transform.position = Vector3.Lerp(this.start, this.end, this.lerpTime)
        }
    }

    /**
     * Component to rotate entity from one rotation (start) to another (end) in an amount of time
     */
    @Component("rotateTransformComponent")
    export class RotateTransformComponent implements ITransformComponent{
        private start: ReadOnlyQuaternion
        private end: ReadOnlyQuaternion
        private speed: number
        private normalizedTime: number
        private interpolationType: TransformSystem.Interpolation
        private lerpTime : number

        onFinishCallback? : ()=>void

        /**
         * Create a RotateTransformComponent instance to add as a component to a Entity
         * @param start starting rotation
         * @param end ending rotation
         * @param duration duration (in seconds) of start to end rotation
         * @param onFinishCallback called when rotation ends
         * @param interpolationType type of interpolation to be used (default: LINEAR)
         */
        constructor(start: ReadOnlyQuaternion, end: ReadOnlyQuaternion, duration: number, onFinishCallback?: ()=>void, interpolationType: TransformSystem.Interpolation = TransformSystem.Interpolation.LINEAR){
            this.start = start
            this.end = end
            this.normalizedTime = 0;
            this.lerpTime = 0;
            this.onFinishCallback = onFinishCallback
            this.interpolationType = interpolationType

            if (duration != 0){
                this.speed = 1 / duration
            }
            else{
                this.speed = 0
                this.normalizedTime = 1;
                this.lerpTime = 1;
            }

            TransformSystem.createAndAddToEngine()
        }

        update(dt: number){
            this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
            this.lerpTime = TransformSystem.Interpolate(this.interpolationType, this.normalizedTime)
        }

        hasFinished(): boolean{
            return this.normalizedTime >= 1
        }

        assignValueToTransform(transform: Transform){
            transform.rotation = Quaternion.Slerp(this.start, this.end, this.lerpTime)
        }
    }

    /**
     * Component to scale entity from one value (start) to another (end) in an amount of time
     */
    @Component("scaleTransformComponent")
    export class ScaleTransformComponent implements ITransformComponent{
        private start: ReadOnlyVector3
        private end: ReadOnlyVector3
        private speed: number
        private normalizedTime: number
        private interpolationType: TransformSystem.Interpolation
        private lerpTime : number

        onFinishCallback? : ()=>void

        /**
         * Create a ScaleTransformComponent instance to add as a component to a Entity
         * @param start starting scale
         * @param end ending scale
         * @param duration duration (in seconds) of start to end scaling
         * @param onFinishCallback called when scaling ends
         */
        constructor(start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void, interpolationType: TransformSystem.Interpolation = TransformSystem.Interpolation.LINEAR){
            this.start = start
            this.end = end
            this.normalizedTime = 0;
            this.lerpTime = 0;
            this.onFinishCallback = onFinishCallback
            this.interpolationType = interpolationType

            if (duration != 0){
                this.speed = 1 / duration
            }
            else{
                this.speed = 0
                this.normalizedTime = 1;
                this.lerpTime = 1;
            }

            TransformSystem.createAndAddToEngine()
        }

        update(dt: number){
            this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
            this.lerpTime = TransformSystem.Interpolate(this.interpolationType, this.normalizedTime)
        }

        hasFinished(): boolean{
            return this.normalizedTime >= 1
        }

        assignValueToTransform(transform: Transform){
            transform.scale = Vector3.Lerp(this.start, this.end, this.lerpTime)
        }
    }

    /**
     * Component to move a entity down a fixed path in an amount of time
     */
    @Component("followPathComponent")
    export class FollowPathComponent implements ITransformComponent{
        private points : Vector3[]
        private speed: number[] = []
        private normalizedTime: number
        private currentIndex: number

        onFinishCallback? : ()=>void
        onPointReachedCallback? : (currentPoint:Vector3, nextPoint:Vector3)=>void

        /**
         * Create a FollowPathComponent instance to add as a component to a Entity
         * @param points array of points for the path
         * @param duration duration of the movement through the path
         * @param onFinishCallback called when movement ends
         * @param onPointReachedCallback called everytime an entity reaches a point of the path
         */
        constructor(points : Vector3[], duration: number, onFinishCallback?: ()=>void, onPointReachedCallback?: (currentPoint:Vector3, nextPoint:Vector3)=>void){
            this.normalizedTime = 0
            this.currentIndex = 0
            this.points = points
            this.onFinishCallback = onFinishCallback
            this.onPointReachedCallback = onPointReachedCallback

            if (points.length < 2){
                throw new Error("At least 2 points are needed for FollowPathComponent.");
            }

            if (duration > 0){
                let sqTotalDist = 0
                let sqPointsDist = []
                for (let i=0; i<points.length-1; i++){
                    let sqDist = Vector3.DistanceSquared(points[i], points[i+1])
                    sqTotalDist += sqDist
                    sqPointsDist.push(sqDist)
                }
                for (let i=0; i<sqPointsDist.length; i++){
                    this.speed.push(1 / (sqPointsDist[i] / sqTotalDist * duration))
                }
            }
            else{
                this.normalizedTime = 1
                this.currentIndex = points.length-2
            }

            TransformSystem.createAndAddToEngine()
        }

        update(dt: number) {
            this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed[this.currentIndex], 0, 1)
            if (this.normalizedTime >= 1 && this.currentIndex < this.points.length-2){
                this.currentIndex ++
                this.normalizedTime = 0
                if (this.onPointReachedCallback && this.currentIndex < this.points.length-1) this.onPointReachedCallback(this.points[this.currentIndex],this.points[this.currentIndex+1])
            }
        }

        hasFinished(): boolean {
            return this.currentIndex >= this.points.length-2 && this.normalizedTime >= 1
        }

        assignValueToTransform(transform: Transform) {
            transform.position = Vector3.Lerp(this.points[this.currentIndex], this.points[this.currentIndex+1], this.normalizedTime)
        }
    }

    @Component("keepRotatingComponent")
    export class KeepRotatingComponent implements ITransformComponent{
        onFinishCallback?: (() => void)

        private rotationVelocity: Quaternion
        private rotation: Quaternion
        private finished: boolean

        constructor(rotationVelocity: Quaternion, onFinishCallback?: ()=>void){
            this.rotationVelocity = rotationVelocity
            this.onFinishCallback = onFinishCallback
            this.rotation = Quaternion.Identity
            this.finished = false
        }

        update(dt: number): void {
            this.rotation = this.rotation.multiply(this.rotationVelocity.scale(dt))
        }

        hasFinished(): boolean {
            return this.finished
        }

        assignValueToTransform(transform: Transform): void {
            transform.rotation = transform.rotation.multiply(this.rotation)
        }

        stop(){
            this.finished = true
        }
        
    }
}