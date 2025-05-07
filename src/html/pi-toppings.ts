import type { PiHoleDevice, SectionConfig } from '@/types';
import { html, type TemplateResult } from 'lit';
import { createAdditionalStat } from './components/additional-stat';

/**
 * Creates the additional stats section for the Pi-hole card
 * @param element - The element to attach the actions to
 * @param device - The Pi-hole device
 * @param config - The configuration for the card
 * @returns TemplateResult
 */
export const createAdditionalStats = (
  element: HTMLElement,
  device: PiHoleDevice,
  config: SectionConfig | undefined = {},
): TemplateResult => {
  return html`
    <div class="additional-stats">
      ${createAdditionalStat(
        element,
        config,
        device.seen_clients,
        'mdi:account-multiple',
        `${device.seen_clients?.state || '0'} clients`,
      )}
      ${createAdditionalStat(
        element,
        config,
        device.dns_unique_domains,
        'mdi:web',
        `${device.dns_unique_domains?.state || '0'} unique domains`,
      )}
      ${createAdditionalStat(
        element,
        config,
        device.dns_queries_cached,
        'mdi:server-network',
        `${device.dns_queries_cached?.state || '0'} cached`,
      )}
      ${createAdditionalStat(
        element,
        config,
        device.dns_queries_forwarded,
        'mdi:dns',
        `${device.dns_queries_forwarded?.state || '0'} forwarded`,
      )}
      ${createAdditionalStat(
        element,
        config,
        device.dns_unique_clients,
        'mdi:account',
        `${device.dns_unique_clients?.state || '0'} unique clients`,
      )}
      ${createAdditionalStat(
        element,
        config,
        device.remaining_until_blocking_mode,
        'mdi:timer-outline',
        `${device.remaining_until_blocking_mode?.state || '0'} time remaining`,
      )}
    </div>
  `;
};
