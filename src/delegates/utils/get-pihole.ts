import type { Config, PiHoleDevice } from '@/types';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import { getDevice } from '../retrievers/device';
import { getDeviceEntities } from './card-entities';

/**
 * Gets the Pi-hole device information from Home Assistant
 * @param hass - The Home Assistant instance
 * @param config - The configuration object
 * @returns The device object or undefined if the device is not found
 */
export const getPiHole = (
  hass: HomeAssistant,
  config: Config,
): PiHoleDevice | undefined => {
  const device: PiHoleDevice = {
    device_id: config.device_id,
  };

  const hassDevice = getDevice(hass, config.device_id);
  if (!hassDevice) {
    return undefined;
  }

  const entities = getDeviceEntities(hass, hassDevice.id);

  // map the entities to the device object
  entities.forEach((entity) => {
    switch (entity.translation_key) {
      // sensors
      case 'dns_queries_today':
        device.dns_queries_today = entity;
        break;
      case 'domains_blocked':
        device.domains_blocked = entity;
        break;
      case 'ads_percentage_blocked_today':
        device.ads_percentage_blocked_today = entity;
        break;
      case 'ads_blocked_today':
        device.ads_blocked_today = entity;
        break;
      case 'seen_clients':
        device.seen_clients = entity;
        break;
      case 'dns_unique_domains':
        device.dns_unique_domains = entity;
        break;
      case 'dns_queries_cached':
        device.dns_queries_cached = entity;
        break;
      case 'dns_queries_forwarded':
        device.dns_queries_forwarded = entity;
        break;
      case 'dns_unique_clients':
        device.dns_unique_clients = entity;
        break;
      case 'remaining_until_blocking_mode':
        device.remaining_until_blocking_mode = entity;
        break;

      // buttons
      case 'action_flush_arp':
        device.action_flush_arp = entity;
        break;
      case 'action_flush_logs':
        device.action_flush_logs = entity;
        break;
      case 'action_gravity':
        device.action_gravity = entity;
        break;
      case 'action_restartdns':
        device.action_restartdns = entity;
        break;
      case 'action_refresh_data':
        device.action_refresh_data = entity;
        break;

      // switches
      case 'group':
        device.group_default = entity;
        break;
      default:
        const domain = computeDomain(entity.entity_id);
        if (domain === 'switch') {
          // going to assume the second switch is the main switch..
          device.switch_pi_hole = entity;
        }
        break;
    }
  });

  // pick entities apart and add to the device...
  /**
   * [
        "binary_sensor.pi_hole_status",
        "switch.pi_hole",
        "switch.pi_hole_group_default",
        "update.pi_hole_core_update_available",
        "update.pi_hole_web_update_available",
        "update.pi_hole_ftl_update_available",
        "update.pi_hole_v6_integration_update"
      ]
   */

  return device;
};
