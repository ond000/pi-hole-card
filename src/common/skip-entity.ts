import type { Config, EntityInformation } from '@/types';

/**
 * Determines if an entity should be skipped based on configuration
 * @param entity - The entity to check
 * @param config - The configuration object containing exclusion rules
 * @returns True if the entity should be skipped, false otherwise
 */
export const shouldSkipEntity = (
  entity: EntityInformation,
  config: Config,
): boolean => {
  if (!config.exclude_entities?.length) {
    return false;
  }

  return config.exclude_entities.some(
    (entityId) => entity.entity_id === entityId,
  );
};
