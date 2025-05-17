import { isCollapsed } from '@common/collapsed-state';
import { show } from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import type { Config, SectionConfig } from '@type/config';
import type { PiHoleDevice } from '@type/types';
import { html, nothing, type TemplateResult } from 'lit';
import { toggleSection } from '../common/toggle-section';
import { createActionButton } from './components/action-control';
import { stateContent } from './components/state-content';

/**
 * Creates the card actions section
 * @param element - The element to attach the actions to
 * @param hass - The Home Assistant instance
 * @param device - The Pi-hole device
 * @param config - The configuration for the card
 * @returns TemplateResult
 */
export const createCardActions = (
  element: HTMLElement,
  hass: HomeAssistant,
  device: PiHoleDevice,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!show(config, 'controls')) return nothing;

  const sectionConfig: SectionConfig = config.controls ?? {
    tap_action: {
      action: 'toggle',
    },
    hold_action: {
      action: 'more-info',
    },
    double_tap_action: {
      action: 'more-info',
    },
  };

  return html`
    <div>
      <div class="collapsible-section">
        <div
          class="section-header"
          @click=${(e: Event) => toggleSection(e, '.switches')}
        >
          <span>Switches</span>
          <ha-icon class="caret-icon" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div
          class="switches ${isCollapsed(config, 'switches') ? 'hidden' : ''}"
        >
          ${device.switches.map((piSwitch) => {
            return stateContent(hass, piSwitch);
          })}
        </div>
      </div>

      <div class="collapsible-section">
        <div
          class="section-header"
          @click=${(e: Event) => toggleSection(e, '.actions')}
        >
          <span>Actions</span>
          <ha-icon class="caret-icon" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="actions ${isCollapsed(config, 'actions') ? 'hidden' : ''}">
          ${device.controls.map((control) => {
            return createActionButton(element, sectionConfig, control, '');
          })}
        </div>
      </div>
    </div>
  `;
};
