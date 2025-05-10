import type { Config, Sections } from '@type/config';

/**
 * Check if a section should be shown based on the configuration
 * @param config - The card configuration
 * @param section - The section to check
 * @returns {boolean} - True if the section should be shown, false otherwise
 */
export const show = (config: Config, section: Sections) =>
  !config.exclude_sections?.includes(section);
