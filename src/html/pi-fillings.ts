import type { Config, PiHoleDevice } from '@/types';
import { show } from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import { html, nothing, type TemplateResult } from 'lit';
import { createStatBox } from './components/stat-box';

/**
 * Creates the dashboard stats section of the Pi-hole card
 * @param element - The HTML element to render the card into
 * @param hass - The Home Assistant object
 * @param device - The Pi-hole device
 * @param config - The card configuration
 * @returns TemplateResult
 */
export const createDashboardStats = (
  element: HTMLElement,
  hass: HomeAssistant,
  device: PiHoleDevice,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!show(config, 'statistics')) return nothing;
  return html`
    <div class="dashboard-stats">
      <!-- First Group: Queries and Blocked -->
      <div class="stat-group">
        ${createStatBox(
          element,
          hass,
          device.dns_queries_today,
          config.stats,
          'card.stats.total_queries',
          localize(
            hass,
            'card.stats.active_clients',
            '{number}',
            device.dns_unique_clients?.state ?? '0',
          ),
          'queries-box',
          'mdi:earth',
        )}
        ${createStatBox(
          element,
          hass,
          device.ads_blocked_today,
          config.stats,
          'card.stats.queries_blocked',
          'card.stats.list_blocked_queries',
          'blocked-box',
          'mdi:hand-back-right',
        )}
      </div>

      <!-- Second Group: Percentage and Domains -->
      <div class="stat-group">
        ${createStatBox(
          element,
          hass,
          device.ads_percentage_blocked_today,
          config.stats,
          'card.stats.percentage_blocked',
          'card.stats.list_all_queries',
          'percentage-box',
          'mdi:chart-pie',
        )}
        ${createStatBox(
          element,
          hass,
          device.domains_blocked,
          config.stats,
          'card.stats.domains_on_lists',
          'card.stats.manage_lists',
          'domains-box',
          'mdi:format-list-bulleted',
        )}
      </div>
    </div>
  `;
};
