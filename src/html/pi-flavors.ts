import type { PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * Creates an action button for the Pi-hole card
 * @param icon - The icon to display
 * @param label - The button label
 * @param onClick - Click handler function
 * @param buttonClass - Optional CSS class for the button
 * @returns TemplateResult
 */
const createActionButton = (
  icon: string,
  label: string,
  onClick: () => void,
  buttonClass?: string,
): TemplateResult => {
  return html`
    <mwc-button @click=${onClick} class="${buttonClass || ''}">
      <ha-icon icon="${icon}"></ha-icon>
      ${label}
    </mwc-button>
  `;
};

/**
 * Creates the card actions section
 * @param device - The Pi-hole device
 * @param hass - The Home Assistant instance
 * @returns TemplateResult
 */
export const createCardActions = (
  hass: HomeAssistant,
  device: PiHoleDevice,
): TemplateResult => {
  // Get status for toggle button
  const isActive = device.switch_pi_hole?.state === 'on';

  // Edge case - don't show buttons if required entity IDs are missing
  if (!device.switch_pi_hole?.entity_id) {
    return html`
      <div class="card-actions">
        <div class="warning">Pi-hole switch entity not available</div>
      </div>
    `;
  }

  // Helper function for toggling entities
  const toggleEntity = (entityId?: string) => {
    if (!entityId) return;
    const currentState = hass.states[entityId]!.state;
    const service = currentState === 'on' ? 'turn_off' : 'turn_on';
    const [domain] = entityId.split('.');

    hass.callService(domain, service, {
      entity_id: entityId,
    });
  };

  // Helper function for calling services
  const callService = (entityId?: string) => {
    if (!entityId) return;
    const [domain, service] = entityId.split('.');
    hass.callService('button', 'press', {
      entity_id: entityId,
    });
  };

  return html`
    <div class="card-actions">
      ${createActionButton(
        isActive ? 'mdi:pause' : 'mdi:play',
        isActive ? 'Disable' : 'Enable',
        () => toggleEntity(device.switch_pi_hole?.entity_id),
        isActive ? 'warning' : 'primary',
      )}
      ${device.action_refresh_data?.entity_id
        ? createActionButton(
            'mdi:refresh',
            'Refresh',
            () => callService(device.action_refresh_data?.entity_id),
            '',
          )
        : nothing}
      ${device.action_restartdns?.entity_id
        ? createActionButton(
            'mdi:restart',
            'Restart DNS',
            () => callService(device.action_restartdns?.entity_id),
            '',
          )
        : nothing}
      ${device.action_gravity?.entity_id
        ? createActionButton(
            'mdi:earth',
            'Update Gravity',
            () => callService(device.action_gravity?.entity_id),
            '',
          )
        : nothing}
    </div>
  `;
};
