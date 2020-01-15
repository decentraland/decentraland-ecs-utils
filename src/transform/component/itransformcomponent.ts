export interface ITransformComponent {
  onFinishCallback?: () => void
  update(dt: number): void
  hasFinished(): boolean
  assignValueToTransform(transform: Transform): void
}
