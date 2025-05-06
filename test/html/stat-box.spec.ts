import type { Config } from '@/types';
import { createStatBox } from '@html/stat-box';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('stat-box.ts', () => {
    it('should render a stat box with provided properties', async () => {
      // Create test data
      const config = { url: 'http://pihole.local' } as Config;
      const title = 'Test Title';
      const value = '123';
      const footerText = 'Footer text';
      const boxClass = 'test-box';
      const iconName = 'mdi:test-icon';
      const path = 'admin/index.php';

      // Call createStatBox function
      const result = createStatBox(
        config,
        title,
        value,
        footerText,
        boxClass,
        iconName,
        path,
      );

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Test assertions
      // Box itself
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('stat-box')).to.be.true;
      expect(el.classList.contains(boxClass)).to.be.true;

      // Check for anchor tag
      const linkEl = el.querySelector('.stat-link');
      expect(linkEl).to.exist;
      expect(linkEl?.getAttribute('href')).to.equal(
        'http://pihole.local/admin/index.php',
      );
      expect(linkEl?.getAttribute('target')).to.equal('_blank');

      // Icon section
      const iconEl = el.querySelector('.stat-icon ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal(iconName);

      // Content section
      const headerEl = el.querySelector('.stat-header');
      expect(headerEl).to.exist;
      expect(headerEl?.textContent?.trim()).to.equal(title);

      const valueEl = el.querySelector('.stat-value');
      expect(valueEl).to.exist;
      expect(valueEl?.textContent?.trim()).to.equal(value);

      // Footer section
      const footerEl = el.querySelector('.stat-footer span');
      expect(footerEl).to.exist;
      expect(footerEl?.textContent?.trim()).to.equal(footerText);

      // Check for the arrow icon in footer
      const footerIconEl = el.querySelector('.stat-footer ha-icon');
      expect(footerIconEl).to.exist;
      expect(footerIconEl?.getAttribute('icon')).to.equal(
        'mdi:arrow-right-circle-outline',
      );
    });

    it('should handle empty values gracefully', async () => {
      // Create stat box with empty strings
      const config = { url: '' } as Config;
      const result = createStatBox(config, '', '', '', '', '', '');

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Test assertions for empty values
      const headerEl = el.querySelector('.stat-header');
      expect(headerEl?.textContent?.trim()).to.equal('');

      const valueEl = el.querySelector('.stat-value');
      expect(valueEl?.textContent?.trim()).to.equal('');

      const footerEl = el.querySelector('.stat-footer span');
      expect(footerEl?.textContent?.trim()).to.equal('');

      const iconEl = el.querySelector('.stat-icon ha-icon');
      expect(iconEl?.getAttribute('icon')).to.equal('');
    });

    it('should handle undefined URL in config', async () => {
      // Create config with undefined URL
      const config = { url: undefined } as Config;
      const result = createStatBox(
        config,
        'Title',
        'Value',
        'Footer',
        'class',
        'mdi:icon',
        'admin/path',
      );

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Check that the link still has a reasonable path
      const linkEl = el.querySelector('.stat-link');
      expect(linkEl).to.exist;
      expect(linkEl?.getAttribute('href')).to.equal('undefined/admin/path');
    });
  });
};
