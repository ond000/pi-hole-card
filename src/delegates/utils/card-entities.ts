import type { EntityInformation } from '@/types';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';

export const getDeviceEntities = (
  hass: HomeAssistant,
  deviceId: string,
): EntityInformation[] => {
  const deviceEntities = Object.values(hass.entities)
    .filter(
      (entity) =>
        entity.device_id === deviceId ||
        entity.entity_id === 'update.pi_hole_v6_integration_update', // brittle
    )
    .map((entity) => {
      const state = getState(hass, entity.entity_id);
      if (state === undefined) {
        return;
      }

      return {
        entity_id: entity.entity_id,
        translation_key: entity.translation_key,
        state: state.state,
        attributes: state.attributes,
      };
    })
    .filter((e) => e !== undefined);
  return deviceEntities;
};
