import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { html, type TemplateResult } from 'lit';
import { refreshTime } from './components/refresh-time';
import { createVersionItem } from './components/version-item';
import { createCardHeader } from './pi-crust';
import { createDashboardStats } from './pi-fillings';
import { createCardActions } from './pi-flavors';
import { createAdditionalStats } from './pi-toppings';

/**
 * Renders the Pi-hole card content
 * @param element - The HTML element to render the card into
 * @param device - The Pi-hole device
 * @param hass - The Home Assistant instance
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const renderPiHoleCard = (
  element: HTMLElement,
  device: PiHoleDevice,
  hass: HomeAssistant,
  config: Config,
): TemplateResult => {
  return html`
    <ha-card>
      ${createCardHeader(device, hass, config)}

      <div class="card-content">
        ${createDashboardStats(element, device, config)}

        <!-- Additional Stats Row -->
        ${createAdditionalStats(hass, element, device, config.info)}
      </div>

      <!-- Card Actions -->
      ${createCardActions(hass, element, device, config.controls)}

      <!-- Version Information Bar -->
      <div class="version-info">
        ${device.updates.map((update) => {
          return createVersionItem(update);
        })}
      </div>

      <!-- Refesh Time -->
      ${refreshTime(element, hass, device)}
    </ha-card>
  `;
};
