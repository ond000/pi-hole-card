import type { Config, PiHoleDevice } from '@/types';
import { stateActive } from '@hass/common/entity/state_active';
import { formatNumber } from '@hass/common/number/format_number';
import type { HomeAssistant } from '@hass/types';
import { html, type TemplateResult } from 'lit';
import { createAdditionalStat } from './additional-stat';
import { createCardActions } from './pi-flavors';
import { createStatBox } from './stat-box';
import { stateDisplay } from './state-display';
import { createVersionItem } from './version-item';

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
  const isActive = stateActive(device.status!, device.status?.state);

  return html`
    <ha-card>
      <div class="card-header">
        <div class="name">
          <ha-icon icon="mdi:pi-hole"></ha-icon>
          Pi-hole
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
        </div>
      </div>

      <div class="card-content">
        <!-- Main dashboard-style stats row -->
        <div class="dashboard-stats">
          <!-- First Group: Queries and Blocked -->
          <div class="stat-group">
            ${createStatBox(
              config,
              'Total queries',
              formatNumber(device.dns_queries_today?.state || '0'),
              `${formatNumber(device.dns_unique_clients?.state || '0')} active clients`,
              'queries-box',
              'mdi:earth',
              'admin/network',
            )}
            ${createStatBox(
              config,
              'Queries Blocked',
              formatNumber(device.ads_blocked_today?.state || '0'),
              'List blocked queries',
              'blocked-box',
              'mdi:hand-back-right',
              'admin/queries?upstream=blocklist',
            )}
          </div>

          <!-- Second Group: Percentage and Domains -->
          <div class="stat-group">
            ${createStatBox(
              config,
              'Percentage Blocked',
              `${formatNumber(
                device.ads_percentage_blocked_today?.state || '0',
                undefined,
                { maximumFractionDigits: 1 },
              )}%`,
              'List all queries',
              'percentage-box',
              'mdi:chart-pie',
              'admin/queries',
            )}
            ${createStatBox(
              config,
              'Domains on Lists',
              formatNumber(device.domains_blocked?.state || '0'),
              'Manage lists',
              'domains-box',
              'mdi:format-list-bulleted',
              'admin/groups-lists',
            )}
          </div>
        </div>

        <!-- Additional Stats Row -->
        <div class="additional-stats">
          ${createAdditionalStat(
            'mdi:account-multiple',
            `${device.seen_clients?.state || '0'} clients`,
          )}
          ${createAdditionalStat(
            'mdi:web',
            `${device.dns_unique_domains?.state || '0'} unique domains`,
          )}
          ${createAdditionalStat(
            'mdi:server-network',
            `${device.dns_queries_cached?.state || '0'} cached`,
          )}
          ${createAdditionalStat(
            'mdi:dns',
            `${device.dns_queries_forwarded?.state || '0'} forwarded`,
          )}
          ${createAdditionalStat(
            'mdi:account',
            `${device.dns_unique_clients?.state || '0'} unique clients`,
          )}
          ${createAdditionalStat(
            'mdi:timer-outline',
            `${device.remaining_until_blocking_mode?.state || '0'} time remaining`,
          )}
        </div>
      </div>

      <!-- Card Actions -->
      ${createCardActions(element, device)}

      <!-- Version Information Bar -->
      <div class="version-info">
        ${createVersionItem(
          'Core',
          device.core_update_available?.attributes?.installed_version,
          'pi-hole/pi-hole',
        )}
        ${createVersionItem(
          'FTL',
          device.ftl_update_available?.attributes?.installed_version,
          'pi-hole/FTL',
        )}
        ${createVersionItem(
          'Web interface',
          device.web_update_available?.attributes?.installed_version,
          'pi-hole/web',
        )}
        ${createVersionItem(
          'HA integration',
          device.integration_update_available?.attributes?.installed_version,
          'bastgau/ha-pi-hole-v6',
        )}
      </div>
    </ha-card>
  `;
};
