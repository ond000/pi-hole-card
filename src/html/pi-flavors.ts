import { isCollapsed } from '@common/collapsed-state';
import { show } from '@common/show-section';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Config, SectionConfig } from '@type/config';
import type { PiHoleDevice } from '@type/types';
import { html, nothing, type TemplateResult } from 'lit';
import { toggleSection } from '../common/toggle-section';
import { createActionButton } from './components/action-control';
import { pause } from './components/pause';
import { stateContent } from './components/state-content';

/**
 * Renders the controls section for the Pi-hole card, including collapsible sections
 * for switches and actions. Each section can be toggled open or closed, and displays
 * the relevant controls based on the provided configuration and device state.
 *
 * @param element - The root HTMLElement for the card.
 * @param hass - The Home Assistant instance.
 * @param device - The PiHoleDevice object containing switches and controls.
 * @param config - The configuration object for the card, including section visibility and entity order.
 * @returns A lit-html TemplateResult representing the controls UI, or `nothing` if the section is hidden.
 */
const controls = (
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

  const switchCollapsed = isCollapsed(config, 'switches');
  const actionsCollapsed = isCollapsed(config, 'actions');

  return html`<div class="collapsible-section">
        <div
          class="section-header"
          @click=${(e: Event) => toggleSection(e, '.switches')}
        >
          <span>${localize(hass, 'card.sections.switches')}</span>
          <ha-icon
            class="caret-icon"
            icon="mdi:chevron-${switchCollapsed ? 'right' : 'down'}"
          ></ha-icon>
        </div>
        <div class="switches ${switchCollapsed ? 'hidden' : ''}">
          ${device.switches.map((piSwitch) => {
            const orderExists = config.entity_order?.includes(
              piSwitch.entity_id,
            );
            if (orderExists) {
              const orderIndex = config.entity_order!.indexOf(
                piSwitch.entity_id,
              );
              const nextItem = config.entity_order![orderIndex + 1];

              if (nextItem === 'divider') {
                return html`<div class="divider"></div>
                  ${stateContent(hass, piSwitch, 'wide')} `;
              }
            }
            return stateContent(hass, piSwitch);
          })}
        </div>
      </div>

      <div class="collapsible-section">
        <div
          class="section-header"
          @click=${(e: Event) => toggleSection(e, '.actions')}
        >
          <span>${localize(hass, 'card.sections.actions')}</span>
          <ha-icon
            class="caret-icon"
            icon="mdi:chevron-${actionsCollapsed ? 'right' : 'down'}"
          ></ha-icon>
        </div>
        <div class="actions ${actionsCollapsed ? 'hidden' : ''}">
          ${device.controls.map((control) => {
            return createActionButton(element, sectionConfig, control, '');
          })}
        </div>
      </div>
    </div>`;
};

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
): TemplateResult => {
  return html`
    <div>
      ${pause(hass, device, config)}${controls(element, hass, device, config)}
    </div>
  `;
};
