import { ITransformComponent } from "./itransformcomponent";
import { TransformSystem } from "../system/transfromSystem";
import { InterpolationType, Interpolate } from "../math/interpolation";

/**
 * Component to scale entity from one value (start) to another (end) in an amount of time
 */
@Component("scaleTransformComponent")
export class ScaleTransformComponent implements ITransformComponent{
    private start: ReadOnlyVector3
    private end: ReadOnlyVector3
    private speed: number
    private normalizedTime: number
    private interpolationType: InterpolationType
    private lerpTime : number

    onFinishCallback? : ()=>void

    /**
     * Create a ScaleTransformComponent instance to add as a component to a Entity
     * @param start starting scale
     * @param end ending scale
     * @param duration duration (in seconds) of start to end scaling
     * @param onFinishCallback called when scaling ends
     */
    constructor(start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void, interpolationType: InterpolationType = InterpolationType.LINEAR){
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
        this.lerpTime = Interpolate(this.interpolationType, this.normalizedTime)
    }

    hasFinished(): boolean{
        return this.normalizedTime >= 1
    }

    assignValueToTransform(transform: Transform){
        transform.scale = Vector3.Lerp(this.start, this.end, this.lerpTime)
    }
}
