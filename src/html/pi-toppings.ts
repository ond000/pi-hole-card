import type { EntityInformation } from '@/types';
import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { type TemplateResult, html, nothing } from 'lit';

/**
 * Creates an action button for the Pi-hole card
 * @param icon - The icon to display
 * @param label - The button label
 * @param onClick - Click handler function
 * @param buttonClass - Optional CSS class for the button
 * @returns TemplateResult
 */
export const createActionButton = (
  element: HTMLElement,
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
      @action=${handleClickAction(element, entity)}
      .actionHandler=${actionHandler()}
    >
      <ha-icon icon="${icon}"></ha-icon>
      ${label}
    </mwc-button>
  `;
};
