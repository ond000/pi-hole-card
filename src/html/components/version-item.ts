import type { EntityInformation } from '@/types';
import { type TemplateResult, html } from 'lit';

/**
 * Creates a version info item
 * @param entity - The entity information
 * @returns TemplateResult
 */
export const createVersionItem = (
  entity: EntityInformation,
): TemplateResult => {
  // super hacky - but too lazy to hardcode the names
  const label = entity.attributes.friendly_name
    .replace('Pi-hole ', '')
    .replace(' update', '');

  return html`
    <div class="version-item">
      <span class="version-label">${label}</span>
      <a href="${entity.attributes.release_url}" target="_blank">
        <span>${entity.attributes.installed_version}</span>
      </a>
    </div>
  `;
};
