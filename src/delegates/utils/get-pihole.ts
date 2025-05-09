import type { Config, PiHoleDevice } from '@/types';
import { mapEntitiesByTranslationKey } from '@common/map-entities';
import { shouldSkipEntity } from '@common/skip-entity';
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

  // Map entities to the device object
  entities.forEach((entity) => {
    if (shouldSkipEntity(entity, config)) {
      return;
    }

    // Skip already handled entities by translation key
    if (mapEntitiesByTranslationKey(entity, device)) {
      return;
    }

    // Handle other entities by domain
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
  });

  // Sort updates by title (using nullish coalescing for cleaner code)
  device.updates.sort((a, b) => {
    const aTitle = a.attributes.title ?? 'z';
    const bTitle = b.attributes.title ?? 'z';
    return aTitle.localeCompare(bTitle);
  });

  return device;
};
