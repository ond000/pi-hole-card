import type { Config, PiHoleDevice } from '@/types';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import { html, type TemplateResult } from 'lit';
import { stateDisplay } from './components/state-display';

/**
 * Creates the card header section
 * @param device - The Pi-hole device
 * @param hass - The Home Assistant instance
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const createCardHeader = (
  device: PiHoleDevice,
  hass: HomeAssistant,
  config: Config,
): TemplateResult => {
  const isActive = stateActive(device.status!, device.status?.state);

  // Check if we should display the remaining time
  const hasRemainingTime =
    device.remaining_until_blocking_mode &&
    device.remaining_until_blocking_mode.state !== '0' &&
    device.remaining_until_blocking_mode.state !== 'unavailable' &&
    device.remaining_until_blocking_mode.state !== 'unknown';

  return html`
    <div class="card-header">
      <div class="name">
        <ha-icon icon="${config.icon ?? 'mdi:pi-hole'}"></ha-icon>
        ${config.title ?? 'Pi-Hole'}
      </div>
      <div
        class="status"
        style="color: ${isActive
          ? 'var(--success-color, green)'
          : 'var(--error-color, red)'}"
      >
        <ha-icon
          icon="${isActive ? 'mdi:check-circle' : 'mdi:close-circle'}"
        ></ha-icon>
        ${stateDisplay(hass, device.status!)}
        ${!isActive && hasRemainingTime
          ? html`${stateDisplay(
              hass,
              device.remaining_until_blocking_mode!,
              'remaining-time',
            )}`
          : ''}
      </div>
    </div>
  `;
};
