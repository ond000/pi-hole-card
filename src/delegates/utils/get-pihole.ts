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
    controls: [],
    sensors: [],
    switches: [],
    updates: [],
  };

  const hassDevice = getDevice(hass, config.device_id);
  if (!hassDevice) {
    return undefined;
  }

  const entities = getDeviceEntities(hass, hassDevice.id, hassDevice.name);

  // map the entities to the device object
  entities.forEach((entity) => {
    switch (entity.translation_key) {
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
      case 'dns_unique_clients':
        device.dns_unique_clients = entity;
        break;
      case 'remaining_until_blocking_mode':
        // todo
        device.remaining_until_blocking_mode = entity;
        break;

      // binary sensors
      case 'status':
        device.status = entity;
        break;

      default:
        const domain = computeDomain(entity.entity_id);
        switch (domain) {
          case 'button':
            device.controls.push(entity);
            break;
          case 'sensor':
            device.sensors.push(entity);
            break;
          case 'switch':
            device.switches.push(entity);
            break;
          case 'update':
            device.updates.push(entity);
            break;
        }
        break;
    }
  });

  // sort the updates by title - this is a bit of a hack, but it works
  // we need to sort the updates by title, but the title is not always present
  // so we need to use a default value of 'z' to sort them to the end
  // this is not ideal, but it works for now - it matches the behavior of the Pi-hole admin console
  device.updates.sort((a, b) => {
    const aTitle = a.attributes.title || 'z';
    const bTitle = b.attributes.title || 'z';
    return aTitle.localeCompare(bTitle);
  });

  return device;
};
