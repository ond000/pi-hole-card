import type { EntityInformation } from '@/types';
import { createVersionItem } from '@html/components/version-item';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('version-item.ts', () => {
    it('should render a version item with label, value, and GitHub link from entity', async () => {
      // Create test entity
      const entity: EntityInformation = {
        entity_id: 'update.pi_hole_core',
        state: 'on',
        translation_key: undefined,
        attributes: {
          friendly_name: 'Pi-hole Core update',
          installed_version: 'v1.2.3',
          release_url: 'https://github.com/test-org/test-repo/releases/v1.2.3',
        },
      };

      // Call createVersionItem function
      const result = createVersionItem(entity);

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Test assertions for the container
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('version-item')).to.be.true;

      // Test assertions for the label
      const labelEl = el.querySelector('.version-label');
      expect(labelEl).to.exist;
      expect(labelEl?.textContent).to.equal('Core'); // Should extract "Core" from "Pi-hole Core update"

      // Test assertions for the link
      const linkEl = el.querySelector('a');
      expect(linkEl).to.exist;
      expect(linkEl?.getAttribute('href')).to.equal(
        'https://github.com/test-org/test-repo/releases/v1.2.3',
      );
      expect(linkEl?.getAttribute('target')).to.equal('_blank');

      // Test assertions for the value inside the link
      const valueEl = linkEl?.querySelector('span');
      expect(valueEl).to.exist;
      expect(valueEl?.textContent).to.equal('v1.2.3');
    });

    it('should handle various types of friendly_name values correctly', async () => {
      // Test different Pi-hole component variations
      const testCases = [
        {
          friendly_name: 'Pi-hole Web update',
          expected_label: 'Web',
        },
        {
          friendly_name: 'Pi-hole FTL update',
          expected_label: 'FTL',
        },
        {
          friendly_name: 'Pi-hole Integration update',
          expected_label: 'Integration',
        },
      ];

      for (const testCase of testCases) {
        const entity: EntityInformation = {
          entity_id: 'update.pi_hole_test',
          state: 'on',
          translation_key: undefined,
          attributes: {
            friendly_name: testCase.friendly_name,
            installed_version: 'v1.0.0',
            release_url:
              'https://github.com/test-org/test-repo/releases/tag/v1.0.0',
          },
        };

        const result = createVersionItem(entity);
        const el = await fixture(result as TemplateResult);

        const labelEl = el.querySelector('.version-label');
        expect(labelEl?.textContent).to.equal(testCase.expected_label);
      }
    });

    it('should properly handle entities without update in the name', async () => {
      const entity: EntityInformation = {
        entity_id: 'update.pi_hole_component',
        state: 'on',
        translation_key: undefined,
        attributes: {
          friendly_name: 'Pi-hole Component',
          installed_version: 'v2.0.0',
          release_url:
            'https://github.com/test-org/test-repo/releases/tag/v2.0.0',
        },
      };

      const result = createVersionItem(entity);
      const el = await fixture(result as TemplateResult);

      const labelEl = el.querySelector('.version-label');
      expect(labelEl?.textContent).to.equal('Component');
    });

    it('should handle non-Pi-hole friendly names', async () => {
      const entity: EntityInformation = {
        entity_id: 'update.something_else',
        state: 'on',
        translation_key: undefined,
        attributes: {
          friendly_name: 'Some Other Component',
          installed_version: 'v3.0.0',
          release_url: 'https://github.com/example/example/releases/tag/v3.0.0',
        },
      };

      const result = createVersionItem(entity);
      const el = await fixture(result as TemplateResult);

      const labelEl = el.querySelector('.version-label');
      expect(labelEl?.textContent).to.equal('Some Other Component');
    });
  });
};
