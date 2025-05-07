import type { Config, PiHoleDevice } from '@/types';
import { formatNumber } from '@hass/common/number/format_number';
import { html, type TemplateResult } from 'lit';
import { createStatBox } from './components/stat-box';

/**
 * Creates the dashboard stats section of the Pi-hole card
 * @param element - The HTML element to render the card into
 * @param device - The Pi-hole device
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const createDashboardStats = (
  element: HTMLElement,
  device: PiHoleDevice,
  config: Config,
): TemplateResult => {
  return html`
    <div class="dashboard-stats">
      <!-- First Group: Queries and Blocked -->
      <div class="stat-group">
        ${createStatBox(
          element,
          device.dns_queries_today,
          config.stats,
          'Total queries',
          `${formatNumber(device.dns_unique_clients?.state || '0')} active clients`,
          'queries-box',
          'mdi:earth',
        )}
        ${createStatBox(
          element,
          device.ads_blocked_today,
          config.stats,
          'Queries Blocked',
          'List blocked queries',
          'blocked-box',
          'mdi:hand-back-right',
        )}
      </div>

      <!-- Second Group: Percentage and Domains -->
      <div class="stat-group">
        ${createStatBox(
          element,
          device.ads_percentage_blocked_today,
          config.stats,
          'Percentage Blocked',
          'List all queries',
          'percentage-box',
          'mdi:chart-pie',
        )}
        ${createStatBox(
          element,
          device.domains_blocked,
          config.stats,
          'Domains on Lists',
          'Manage lists',
          'domains-box',
          'mdi:format-list-bulleted',
        )}
      </div>
    </div>
  `;
};
