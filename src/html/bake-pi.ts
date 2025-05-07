import type { Config, PiHoleDevice } from '@/types';
import type { HomeAssistant } from '@hass/types';
import { html, type TemplateResult } from 'lit';
import { createCardHeader } from './pi-crust';
import { createDashboardStats } from './pi-fillings';
import { createCardActions } from './pi-flavors';
import { createAdditionalStats } from './pi-toppings';
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
  return html`
    <ha-card>
      ${createCardHeader(device, hass, config)}

      <div class="card-content">
        ${createDashboardStats(element, device, config)}

        <!-- Additional Stats Row -->
        ${createAdditionalStats(element, device, config.info)}
      </div>

      <!-- Card Actions -->
      ${createCardActions(element, device, config.controls)}

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
