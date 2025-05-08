import type { PiHoleDevice, SectionConfig } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { html, type TemplateResult } from 'lit';
import { createActionButton } from './components/action-control';
import { stateContent } from './components/state-content';

/**
 * Creates the card actions section
 * @param element - The element to attach the actions to
 * @param device - The Pi-hole device
 * @param config - The configuration for the card
 * @returns TemplateResult
 */
export const createCardActions = (
  hass: HomeAssistant,
  element: HTMLElement,
  device: PiHoleDevice,
  config: SectionConfig = {
    tap_action: {
      action: 'toggle',
    },
    hold_action: {
      action: 'more-info',
    },
    double_tap_action: {
      action: 'more-info',
    },
  },
): TemplateResult => {
  return html`
    <div>
      <div class="switches">
        ${device.switches.map((piSwitch) => {
          return stateContent(hass, piSwitch);
        })}
      </div>
      <div class="actions">
        ${device.controls.map((control) => {
          return createActionButton(element, config, control, '');
        })}
      </div>
    </div>
  `;
};
