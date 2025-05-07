import type { EntityInformation, SectionConfig } from '@/types';
import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { type TemplateResult, html, nothing } from 'lit';

/**
 * Creates an action button for the Pi-hole card
 * @param element - The element to attach the action to
 * @param config - The section configuration
 * @param entity - The entity information
 * @param icon - The icon to display
 * @param label - The button label
 * @param buttonClass - Optional CSS class for the button
 * @returns TemplateResult
 */
export const createActionButton = (
  element: HTMLElement,
  config: SectionConfig,
  entity: EntityInformation | undefined,
  icon: string,
  label: string,
  buttonClass?: string,
): TemplateResult | typeof nothing => {
  if (!entity) {
    return nothing;
  }

  return html`
    <mwc-button
      class="${buttonClass || ''}"
      @action=${handleClickAction(element, config, entity)}
      .actionHandler=${actionHandler(config)}
    >
      <ha-icon icon="${icon}"></ha-icon>
      ${label}
    </mwc-button>
  `;
};
