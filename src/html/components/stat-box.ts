import type { EntityInformation, SectionConfig } from '@/types';
import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { formatNumber } from '@hass/common/number/format_number';
import { type TemplateResult, html, nothing } from 'lit';

/**
 * Creates a stat box for the Pi-hole dashboard
 * @param element - The element to attach the action to
 * @param entity - The entity information
 * @param sectionConfig - The section configuration
 * @param title - The title of the stat box
 * @param footerText - The footer text
 * @param boxClass - The CSS class for styling
 * @param iconName - Icon name for the background (mdi icon)
 * @returns TemplateResult
 */
export const createStatBox = (
  element: HTMLElement,
  entity: EntityInformation | undefined,
  sectionConfig: SectionConfig | undefined,
  title: string,
  footerText: string,
  boxClass: string,
  iconName: string,
): TemplateResult | typeof nothing => {
  if (!entity) return nothing;

  const uom = entity.attributes?.unit_of_measurement === '%' ? '%' : '';
  const value = formatNumber(entity.state, undefined, {
    maximumFractionDigits: 1,
  });

  return html`
    <div
      class="stat-box ${boxClass}"
      @action=${handleClickAction(element, sectionConfig, entity)}
      .actionHandler=${actionHandler(sectionConfig)}
    >
      <div class="stat-icon">
        <ha-icon icon="${iconName}"></ha-icon>
      </div>
      <div class="stat-content">
        <div class="stat-header">${title}</div>
        <div class="stat-value">${value}${uom}</div>
      </div>
      <div class="stat-footer">
        <span>${footerText}</span>
        <ha-icon icon="mdi:arrow-right-circle-outline"></ha-icon>
      </div>
    </div>
  `;
};
