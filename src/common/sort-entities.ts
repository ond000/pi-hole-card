import type { Config } from '@type/config';
import type { EntityInformation } from '@type/types';

/**
 * Sorts an array of entities based on a specified order defined in the configuration.
 *
 * If the `entity_order` property exists and contains entity IDs, the function will sort
 * the `entities` array so that entities appear in the same order as specified in `entity_order`.
 * Entities not present in `entity_order` will be placed at the end of the array, preserving their original order.
 *
 * @param config - The configuration object containing the `entity_order` array, which defines the desired order of entity IDs.
 * @param entities - The array of `EntityInformation` objects to be sorted.
 * @returns The sorted array of entities, ordered according to `entity_order` if specified.
 */
export const sortEntitiesByOrder = (
  config: Config,
  entities: EntityInformation[],
) => {
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
  return entities;
};
