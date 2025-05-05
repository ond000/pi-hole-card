import type { EntityInformation } from '@/types';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';

export const getDeviceEntities = (
  hass: HomeAssistant,
  deviceId: string,
): EntityInformation[] => {
  const deviceEntities = Object.values(hass.entities)
    .filter((entity) => entity.device_id === deviceId)
    .map((entity) => {
      const state = getState(hass, entity.entity_id);
      if (state === undefined) {
        return;
      }

      console.log('Entity:', entity, 'State:', state);

      return {
        state: state.state,
        translation_key: entity.translation_key,
        entity_id: entity.entity_id,
      };
    })
    .filter((e) => e !== undefined) as EntityInformation[];
  return deviceEntities;
};
