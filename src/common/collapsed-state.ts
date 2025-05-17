import type { CollapsibleSections, Config } from '@type/config';

/**
 * Check if a section should be collapsed based on the configuration
 * @param config - The card configuration
 * @param section - The section to check
 * @returns {boolean} - True if the section should be collapsed, false otherwise
 */
export const isCollapsed = (
  config: Config,
  section: CollapsibleSections,
): boolean => !!config.collapsed_sections?.includes(section);
