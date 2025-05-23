import type { Config } from '@type/config';
import type { PiHoleSetup } from '@type/types';
import { html, type TemplateResult } from 'lit';

/**
 * Renders an icon or a warning badge based on the number of info messages in the Pi-hole setup.
 *
 * @param config - The configuration object containing icon information.
 * @param setup - The PiHoleSetup object containing the list of holes and their info message counts.
 * @returns A TemplateResult displaying either the configured icon (or a default) or a warning badge with the info count.
 */
export const icon = (config: Config, setup: PiHoleSetup): TemplateResult => {
  const infoCount = setup.holes.reduce((acc, h) => {
    if (
      h.info_message_count &&
      !Number.isNaN(Number(h.info_message_count.state))
    ) {
      return acc + Number(h.info_message_count.state);
    }
    return acc;
  }, 0);

  return infoCount === 0
    ? html`<ha-icon icon="${config.icon ?? 'mdi:pi-hole'}"></ha-icon>`
    : html`<div class="warning-badge">${infoCount}</div>`;
};
