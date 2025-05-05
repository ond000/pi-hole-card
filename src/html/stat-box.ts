import { type TemplateResult, html } from 'lit';

/**
 * Creates a stat box for the Pi-hole dashboard
 * @param title - The title of the stat box
 * @param value - The value to display
 * @param footerText - The footer text
 * @param boxClass - The CSS class for styling
 * @param iconName - Icon name for the background (mdi icon)
 * @param onClick - Click handler function
 * @returns TemplateResult
 */

export const createStatBox = (
  title: string,
  value: string,
  footerText: string,
  boxClass: string,
  iconName: string,
  onClick: () => void,
): TemplateResult => {
  return html`
    <div class="stat-box ${boxClass}" @click=${onClick}>
      <div class="stat-icon">
        <ha-icon icon="${iconName}"></ha-icon>
      </div>
      <div class="stat-content">
        <div class="stat-header">${title}</div>
        <div class="stat-value">${value}</div>
      </div>
      <div class="stat-footer">
        <span>${footerText}</span>
        <ha-icon icon="mdi:arrow-right-circle-outline"></ha-icon>
      </div>
    </div>
  `;
};
