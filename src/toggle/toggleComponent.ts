export enum ToggleState {
  Off = 0,
  On
}

/**
 * Toggle component for entities with two states (ON or OFF)
 */
@Component('toggle')
export class ToggleComponent {
  public enabled: boolean = true

  private onValueChangedCallback?: (value: ToggleState) => void
  private state: ToggleState = ToggleState.Off

  /**
   * Create an instance of a ToggleComponent
   * @param {ToggleState} startingState starting state of the toggle (ON or OFF)
   * @param {(value: ToggleState) => void} onValueChangedCallback called when toggle state changed
   */
  constructor(
    startingState: ToggleState = ToggleState.On,
    onValueChangedCallback?: (value: ToggleState) => void
  ) {
    this.set(startingState)
    if (onValueChangedCallback) this.setCallback(onValueChangedCallback)
  }

  /**
   * Set trigger to a state
   * @param {ToggleState} state new state
   */
  public set(state: ToggleState): void {
    this.state = state
    if (this.onValueChangedCallback) this.onValueChangedCallback(state)
  }

  /**
   * Toggle state of ToggleComponent
   */
  public toggle(): void {
    if (this.enabled) {
      this.set(1 - this.state)
    }
  }

  /**
   * Get if the current toggle state is ON
   * @return {boolean}
   */
  public isOn(): boolean {
    return this.state == ToggleState.On
  }

  /**
   * Set callback for when ToggleComponent state changed
   * @param {(value: ToggleState) => void} onValueChangedCallback callback
   */
  public setCallback(
    onValueChangedCallback: (value: ToggleState) => void
  ): void {
    this.onValueChangedCallback = onValueChangedCallback
  }
}

export default {
  ToggleComponent,
  ToggleState
}
