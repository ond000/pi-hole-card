import type { PiHoleDevice, SectionConfig } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { html, type TemplateResult } from 'lit';
import { createAdditionalStat } from './components/additional-stat';

/**
 * Creates the additional stats section for the Pi-hole card
 * @param hass - The Home Assistant instance
 * @param element - The element to attach the actions to
 * @param device - The Pi-hole device
 * @param config - The configuration for the card
 * @returns TemplateResult
 */
export const createAdditionalStats = (
  hass: HomeAssistant,
  element: HTMLElement,
  device: PiHoleDevice,
  config: SectionConfig | undefined = {},
): TemplateResult => {
  return html`
    <div class="additional-stats">
      ${device.sensors.map((sensor) => {
        return createAdditionalStat(hass, element, config, sensor);
      })}
    </div>
  `;
};
