import { createAdditionalStat } from '@html/additional-stat';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('additional-stat.ts', () => {
    it('should render an additional stat with provided icon and text', async () => {
      // Create test data
      const icon = 'mdi:test-icon';
      const text = 'Test Stat Text';

      // Call createAdditionalStat function
      const result = createAdditionalStat(icon, text);

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Test assertions for the container
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('additional-stat')).to.be.true;

      // Test assertions for the icon
      const iconEl = el.querySelector('ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal(icon);

      // Test assertions for the text
      const textEl = el.querySelector('span');
      expect(textEl).to.exist;
      expect(textEl?.textContent).to.equal(text);
    });

    it('should handle empty values gracefully', async () => {
      // Call createAdditionalStat with empty strings
      const result = createAdditionalStat('', '');

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Check that the component still renders with empty values
      const iconEl = el.querySelector('ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal('');

      const textEl = el.querySelector('span');
      expect(textEl).to.exist;
      expect(textEl?.textContent).to.equal('');
    });

    it('should preserve text with special characters', async () => {
      // Test with text containing special characters
      const specialText = '123 &lt; clients &gt; <b>Test</b>';

      // Call createAdditionalStat
      const result = createAdditionalStat('mdi:icon', specialText);

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Check that the text content is preserved
      const textEl = el.querySelector('span');
      expect(textEl?.textContent).to.equal(specialText);
    });
  });
};
