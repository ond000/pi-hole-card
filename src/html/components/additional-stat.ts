import type { EntityInformation, SectionConfig } from '@/types';
import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { type TemplateResult, html, nothing } from 'lit';

/**
 * Creates an additional stat item
 * @param element - The element to attach the action to
 * @param config - The section configuration
 * @param entity - The entity information
 * @param icon - The icon to display
 * @param text - The text to display
 * @returns TemplateResult
 */
export const createAdditionalStat = (
  element: HTMLElement,
  config: SectionConfig | undefined,
  entity: EntityInformation | undefined,
  icon: string,
  text: string,
): TemplateResult | typeof nothing => {
  if (!entity) {
    return nothing;
  }

  return html`
    <div
      class="additional-stat"
      @action=${handleClickAction(element, config, entity)}
      .actionHandler=${actionHandler(config)}
    >
      <ha-icon icon="${icon}"></ha-icon>
      <span>${text}</span>
    </div>
  `;
};
