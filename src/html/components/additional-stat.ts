import { type TemplateResult, html } from 'lit';

/**
 * Creates an additional stat item
 * @param icon - The icon to display
 * @param text - The text to display
 * @returns TemplateResult
 */

export const createAdditionalStat = (
  icon: string,
  text: string,
): TemplateResult => {
  return html`
    <div class="additional-stat">
      <ha-icon icon="${icon}"></ha-icon>
      <span>${text}</span>
    </div>
  `;
};
