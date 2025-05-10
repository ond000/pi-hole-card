import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { PiHoleDevice } from '@type/types';
import { html, type TemplateResult } from 'lit';
import { createCardHeader } from './pi-crust';
import { createDashboardStats } from './pi-fillings';
import { createCardActions } from './pi-flavors';
import { createFooter } from './pi-tin';
import { createAdditionalStats } from './pi-toppings';

/**
 * Renders the Pi-hole card content
 * @param element - The HTML element to render the card into
 * @param hass - The Home Assistant instance
 * @param device - The Pi-hole device
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const renderPiHoleCard = (
  element: HTMLElement,
  hass: HomeAssistant,
  device: PiHoleDevice,
  config: Config,
): TemplateResult => {
  return html`
    <ha-card>
      ${createCardHeader(device, hass, config)}
      <div class="card-content">
        ${createDashboardStats(element, hass, device, config)}
        ${createAdditionalStats(element, hass, device, config)}
      </div>
      ${createCardActions(element, hass, device, config)}
      ${createFooter(element, hass, config, device)}
    </ha-card>
  `;
};
