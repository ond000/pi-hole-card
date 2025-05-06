import { createVersionItem } from '@html/version-item';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('version-item.ts', () => {
    it('should render a version item with label, value, and GitHub link', async () => {
      // Create test data
      const label = 'Test Version';
      const value = 'v1.2.3';
      const project = 'test-org/test-repo';

      // Call createVersionItem function
      const result = createVersionItem(label, value, project);

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Test assertions for the container
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('version-item')).to.be.true;

      // Test assertions for the label
      const labelEl = el.querySelector('.version-label');
      expect(labelEl).to.exist;
      expect(labelEl?.textContent).to.equal(label);

      // Test assertions for the link
      const linkEl = el.querySelector('a');
      expect(linkEl).to.exist;
      expect(linkEl?.getAttribute('href')).to.equal(
        `https://github.com/${project}/releases/${value}`,
      );
      expect(linkEl?.getAttribute('target')).to.equal('_blank');

      // Test assertions for the value inside the link
      const valueEl = linkEl?.querySelector('span');
      expect(valueEl).to.exist;
      expect(valueEl?.textContent).to.equal(value);
    });

    it('should handle undefined or empty values gracefully', async () => {
      // Test with empty strings
      const result = createVersionItem('', '', '');

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Check that the component still renders with empty values
      expect(el.querySelector('.version-label')?.textContent).to.equal('');

      const linkEl = el.querySelector('a');
      expect(linkEl?.getAttribute('href')).to.equal(
        'https://github.com//releases/',
      );
      expect(linkEl?.querySelector('span')?.textContent).to.equal('');
    });

    it('should properly construct the GitHub release URL', async () => {
      // Test different project and version combinations
      const testCases = [
        {
          project: 'org/repo',
          value: 'v1.0.0',
          expected: 'https://github.com/org/repo/releases/v1.0.0',
        },
        {
          project: 'private-org/app',
          value: 'latest',
          expected: 'https://github.com/private-org/app/releases/latest',
        },
        {
          project: 'user/project-name',
          value: 'beta',
          expected: 'https://github.com/user/project-name/releases/beta',
        },
      ];

      for (const testCase of testCases) {
        const result = createVersionItem(
          'Test',
          testCase.value,
          testCase.project,
        );
        const el = await fixture(result as TemplateResult);

        const linkEl = el.querySelector('a');
        expect(linkEl?.getAttribute('href')).to.equal(testCase.expected);
      }
    });
  });
};
