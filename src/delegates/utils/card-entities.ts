import type { Config, EntityInformation } from '@/types';
import type { HomeAssistant } from '@hass/types';

export const getDeviceEntities = (
  hass: HomeAssistant,
  config: Config,
  deviceId: string,
): EntityInformation[] => {
  const deviceEntities = Object.values(hass.entities)
    .filter((entity) => entity.device_id === deviceId)
    .map((entity) => {
      return {
        entity_id: entity.entity_id,
      };
    })
    .filter((e) => e !== undefined) as EntityInformation[];
  return deviceEntities;
};
