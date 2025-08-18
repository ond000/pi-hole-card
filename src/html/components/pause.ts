import { isCollapsed } from '@common/collapsed-state';
import { formatSecondsToHuman, parseTimeToSeconds } from '@common/convert-time';
import { show } from '@common/show-section';
import { toggleSection } from '@common/toggle-section';
import { handlePauseClick } from '@delegates/utils/pause-hole';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Config } from '@type/config';
import type { PiHoleSetup } from '@type/types';
import { html, nothing } from 'lit';

/**
 * Renders a collapsible UI section for pausing Pi-hole ad-blocking for a specified duration.
 *
 * @param hass - The Home Assistant instance.
 * @param setup - The Pi-hole setup to be paused.
 * @param config - The configuration object containing UI and pause duration settings.
 * @returns A lit-html template for the pause section, or `nothing` if the section should not be shown.
 *
 * The section displays a list of buttons for each pause duration, allowing the user to pause ad-blocking
 * for the selected amount of time. The section can be collapsed or expanded based on the configuration.
 */
export const pause = (
  hass: HomeAssistant,
  setup: PiHoleSetup,
  config: Config,
) => {
  if (!show(config, 'pause')) return nothing;

  const pauseCollapsed = isCollapsed(config, 'pause');
  const pauseDuration = config.pause_durations ?? [60, 300, 900];

  return html`<div class="collapsible-section">
    <div
      class="section-header"
      @click=${(e: Event) => toggleSection(e, '.pause')}
    >
      <span>${localize(hass, 'card.sections.pause')}</span>
      <ha-icon
        class="caret-icon"
        icon="mdi:chevron-${pauseCollapsed ? 'right' : 'down'}"
      ></ha-icon>
    </div>
    <div class="pause ${pauseCollapsed ? 'hidden' : ''}">
      ${pauseDuration.map((duration) => {
        const seconds = parseTimeToSeconds(duration);
        const displayText = formatSecondsToHuman(seconds, hass);
        return html`<mwc-button @click=${handlePauseClick(hass, setup, seconds)}
          >${displayText}</mwc-button
        >`;
      })}
    </div>
  </div>`;
};
