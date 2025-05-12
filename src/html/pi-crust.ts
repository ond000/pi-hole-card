import { show } from '@common/show-section';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { PiHoleSetup } from '@type/types';
import { html, nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './components/state-display';

/**
 * Creates the card header section
 * @param setup - The Pi-hole setup
 * @param hass - The Home Assistant instance
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const createCardHeader = (
  setup: PiHoleSetup,
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!show(config, 'header')) return nothing;

  const primary = setup.holes[0]!;
  const activeCount = setup.holes
    .map((h) => h.status)
    .filter(
      (status) => status !== undefined && stateActive(status, status?.state),
    ).length;
  const mixedStatus = activeCount > 0 && activeCount < setup.holes.length;

  // Check if we should display the remaining time
  const hasRemainingTime =
    primary.remaining_until_blocking_mode &&
    primary.remaining_until_blocking_mode.state !== '0' &&
    primary.remaining_until_blocking_mode.state !== 'unavailable' &&
    primary.remaining_until_blocking_mode.state !== 'unknown';

  return html`
    <div class="card-header">
      <div class="name">
        <ha-icon icon="${config.icon ?? 'mdi:pi-hole'}"></ha-icon>
        ${config.title ?? 'Pi-Hole'}
        ${setup.holes.length > 1
          ? html`<span class="multi-status"
              >(${activeCount}/${setup.holes.length})</span
            >`
          : ''}
      </div>
      <div
        style="color: ${mixedStatus
          ? 'var(--warning-color, orange)'
          : activeCount > 0
            ? 'var(--success-color, green)'
            : 'var(--error-color, red)'}"
      >
        <ha-icon
          icon="${activeCount > 0 ? 'mdi:check-circle' : 'mdi:close-circle'}"
        ></ha-icon>
        ${mixedStatus ? html`Partial` : stateDisplay(hass, primary.status!)}
        ${!(activeCount > 0) && hasRemainingTime
          ? html`${stateDisplay(
              hass,
              primary.remaining_until_blocking_mode!,
              'remaining-time',
            )}`
          : ''}
      </div>
    </div>
  `;
};
