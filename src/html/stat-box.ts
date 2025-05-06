import type { Config } from '@/types';
import { type TemplateResult, html } from 'lit';

/**
 * Creates a stat box for the Pi-hole dashboard
 * @param config - The card configuration
 * @param title - The title of the stat box
 * @param value - The value to display
 * @param footerText - The footer text
 * @param boxClass - The CSS class for styling
 * @param iconName - Icon name for the background (mdi icon)
 * @param path - URL path to open when the box is clicked
 * @returns TemplateResult
 */
export const createStatBox = (
  config: Config,
  title: string,
  value: string,
  footerText: string,
  boxClass: string,
  iconName: string,
  path: string,
): TemplateResult => {
  const piholeUrl = `${config.url?.replace(/\/$/, '')}/${path}`;

  return html`
    <div class="stat-box ${boxClass}">
      <a href="${piholeUrl}" class="stat-link" target="_blank">
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
      </a>
    </div>
  `;
};
