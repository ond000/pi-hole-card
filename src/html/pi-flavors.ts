import type { PiHoleDevice, SectionConfig } from '@/types';
import { html, nothing, type TemplateResult } from 'lit';
import { createActionButton } from './pi-toppings';

/**
 * Creates the card actions section
 * @param element - The element to attach the actions to
 * @param device - The Pi-hole device
 * @param config - The configuration for the card
 * @returns TemplateResult
 */
export const createCardActions = (
  element: HTMLElement,
  device: PiHoleDevice,
  config: SectionConfig | undefined = {
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
  // Get status for toggle button
  const isActive = device.switch_pi_hole?.state === 'on';

  return html`
    <div class="card-actions">
      ${createActionButton(
        element,
        config,
        device.switch_pi_hole,
        isActive ? 'mdi:pause' : 'mdi:play',
        isActive ? 'Disable' : 'Enable',
        isActive ? 'warning' : 'primary',
      )}
      ${device.action_refresh_data?.entity_id
        ? createActionButton(
            element,
            config,
            device.action_refresh_data,
            'mdi:refresh',
            'Refresh',
            '',
          )
        : nothing}
      ${device.action_restartdns?.entity_id
        ? createActionButton(
            element,
            config,
            device.action_restartdns,
            'mdi:restart',
            'Restart DNS',
            '',
          )
        : nothing}
      ${device.action_gravity?.entity_id
        ? createActionButton(
            element,
            config,
            device.action_gravity,
            'mdi:earth',
            'Update Gravity',
            '',
          )
        : nothing}
    </div>
  `;
};
