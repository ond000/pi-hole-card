import { renderPiHoleCard } from '@/html/bake-pi';
import { getConfigDevice } from '@delegates/utils/get-config-device';
import { getPiHole } from '@delegates/utils/get-pihole';
import type { HomeAssistant } from '@hass/types';
import { CSSResult, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from '../styles';
import type { Config, PiHoleDevice } from '../types';
const equal = require('fast-deep-equal');

/**
 * Pi-hole card class
 * @extends {LitElement}
 */
export class PiHoleCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Pi-hole information
   */
  @state()
  protected _device!: PiHoleDevice;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    if (!equal(config, this._config)) {
      this._config = config;
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    const device = getPiHole(hass, this._config);

    if (device && !equal(device, this._device)) {
      this._device = device;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('pi-hole-editor');
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    const device = await getConfigDevice(hass);

    return {
      device_id: device?.id ?? '',
    };
  }

  override render() {
    if (!this._hass || !this._config) {
      return html`<ha-card>
        <div class="card-content">
          <div class="no-devices">Loading...</div>
        </div>
      </ha-card>`;
    }

    return renderPiHoleCard(this, this._device, this._hass, this._config);
  }
}
