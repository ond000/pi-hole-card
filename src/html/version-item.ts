import { type TemplateResult, html } from 'lit';

/**
 * Creates a version info item
 * @param label - The label for the version
 * @param value - The version value
 * @param project - The project name
 * @returns TemplateResult
 */

export const createVersionItem = (
  label: string,
  value: string,
  project: string,
): TemplateResult => {
  return html`
    <div class="version-item">
      <span class="version-label">${label}</span>
      <a href="https://github.com/${project}/releases/${value}" target="_blank">
        <span>${value}</span>
      </a>
    </div>
  `;
};
