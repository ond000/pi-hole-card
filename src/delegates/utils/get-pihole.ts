import type { Config, PiHoleDevice } from '@/types';
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
    name: '',
    ip_address: '',
    mac_address: '',
    status: '',
    type: '',
  };

  const hassDevice = getDevice(hass, config.device_id);
  if (!hassDevice) {
    return undefined;
  }

  const entities = getDeviceEntities(hass, config, hassDevice.id);

  console.log('Entities:', entities);

  // pick entities apart and add to the device...
  /**
   * [
        "binary_sensor.pi_hole_status",
        "sensor.pi_hole_remaining_until_blocking_mode",
        "sensor.pi_hole_ads_blocked_today",
        "sensor.pi_hole_ads_percentage_blocked_today",
        "sensor.pi_hole_seen_clients",
        "sensor.pi_hole_dns_queries_today",
        "sensor.pi_hole_domains_blocked",
        "sensor.pi_hole_dns_queries_cached",
        "sensor.pi_hole_dns_queries_forwarded",
        "sensor.pi_hole_dns_unique_clients",
        "sensor.pi_hole_dns_unique_domains",
        "switch.pi_hole",
        "switch.pi_hole_group_default",
        "update.pi_hole_core_update_available",
        "update.pi_hole_web_update_available",
        "update.pi_hole_ftl_update_available",
        "button.pi_hole_action_flush_arp",
        "button.pi_hole_action_flush_logs",
        "button.pi_hole_action_gravity",
        "button.pi_hole_action_restartdns",
        "button.pi_hole_action_refresh_data"
      ]
   */

  return device;
};
