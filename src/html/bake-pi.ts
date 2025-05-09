import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { html, type TemplateResult } from 'lit';
import { createCardHeader } from './pi-crust';
import { createDashboardStats } from './pi-fillings';
import { createCardActions } from './pi-flavors';
import { createFooter } from './pi-tin';
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
        ${createAdditionalStats(hass, element, device, config)}
      </div>
      ${createCardActions(hass, element, device, config)}
      ${createFooter(element, hass, config, device)}
    </ha-card>
  `;
};
