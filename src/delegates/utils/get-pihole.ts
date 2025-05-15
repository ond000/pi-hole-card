import { mapEntitiesByTranslationKey } from '@common/map-entities';
import { shouldSkipEntity } from '@common/skip-entity';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { PiHoleDevice } from '@type/types';
import { getDevice } from '../retrievers/device';
import { getDeviceEntities } from './card-entities';

/**
 * Gets the Pi-hole device information from Home Assistant
 * @param hass - The Home Assistant instance
 * @param config - The configuration object
 * @param deviceId - The unique identifier for the device
 * @returns The device object or undefined if the device is not found
 */
export const getPiHole = (
  hass: HomeAssistant,
  config: Config,
  deviceId: string,
): PiHoleDevice | undefined => {
  const device: PiHoleDevice = {
    device_id: deviceId,
    controls: [],
    sensors: [],
    switches: [],
    updates: [],
  };

  const hassDevice = getDevice(hass, device.device_id);
  if (!hassDevice) {
    return undefined;
  }

  // Get all entities for the device
  let entities = getDeviceEntities(hass, hassDevice.id, hassDevice.name);

  // Order entities according to the entity_order property if it exists
  if (config.entity_order?.length) {
    const entityOrderMap = new Map<string, number>();

    // Create a map with entity_id as key and its position in entity_order as value
    config.entity_order.forEach((entityId, index) => {
      entityOrderMap.set(entityId, index);
    });

    // Sort entities based on their position in entity_order
    // Entities not in entity_order will have undefined position and will be placed at the end
    entities = entities.sort((a, b) => {
      const aPosition = entityOrderMap.has(a.entity_id)
        ? entityOrderMap.get(a.entity_id)
        : Number.MAX_SAFE_INTEGER;
      const bPosition = entityOrderMap.has(b.entity_id)
        ? entityOrderMap.get(b.entity_id)
        : Number.MAX_SAFE_INTEGER;

      return (
        (aPosition ?? Number.MAX_SAFE_INTEGER) -
        (bPosition ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }

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
