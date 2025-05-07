import type { Config, EntityInformation, SectionConfig } from '@/types';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import { createStatBox } from '@html/components/stat-box';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { restore, stub } from 'sinon';

export default () => {
  describe('stat-box.ts', () => {
    let mockElement: HTMLElement;
    let mockConfig: Config;
    let mockEntity: EntityInformation;
    let mockSectionConfig: SectionConfig;
    let actionHandlerStub: sinon.SinonStub;
    let handleClickActionStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element and configs
      mockElement = document.createElement('div');
      mockConfig = { device_id: 'test_device' };
      mockSectionConfig = {
        tap_action: { action: 'more-info' },
        hold_action: { action: 'toggle' },
      };
      mockEntity = {
        entity_id: 'sensor.test_entity',
        state: '123',
        attributes: { friendly_name: 'Test Entity' },
        translation_key: 'test_key',
      };

      // Create stubs for action handlers
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns(
        {},
      );
      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
      ).returns({
        handleEvent: () => {},
      });
    });

    afterEach(() => {
      // Restore all stubs
      restore();
    });

    it('should render a stat box with provided properties and action handlers', async () => {
      // Create test data
      const title = 'Test Title';
      const footerText = 'Footer text';
      const boxClass = 'test-box';
      const iconName = 'mdi:test-icon';

      // Call createStatBox function
      const result = createStatBox(
        mockElement,
        mockEntity,
        mockSectionConfig,
        title,
        footerText,
        boxClass,
        iconName,
      );

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Test assertions for box structure
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('stat-box')).to.be.true;
      expect(el.classList.contains(boxClass)).to.be.true;

      // Check action handlers were properly called
      expect(actionHandlerStub.calledWith(mockSectionConfig)).to.be.true;
      expect(
        handleClickActionStub.calledWith(
          mockElement,
          mockSectionConfig,
          mockEntity,
        ),
      ).to.be.true;

      // Icon section
      const iconEl = el.querySelector('.stat-icon ha-icon');
      expect(iconEl).to.exist;
      expect(iconEl?.getAttribute('icon')).to.equal(iconName);

      // Content section
      const headerEl = el.querySelector('.stat-header');
      expect(headerEl).to.exist;
      expect(headerEl?.textContent?.trim()).to.equal(title);

      // Value section - should format the entity state
      const valueEl = el.querySelector('.stat-value');
      expect(valueEl).to.exist;
      expect(valueEl?.textContent?.trim()).to.equal('123');

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

    it('should handle missing entity data', async () => {
      const result = createStatBox(
        mockElement,
        undefined,
        mockSectionConfig,
        'Title',
        'Footer',
        'class',
        'mdi:icon',
      );

      expect(result).to.equal(nothing);
    });

    it('should format numeric values properly', async () => {
      // Test with various numeric values
      const testCases = [
        { state: '1234', expected: '1,234' },
        { state: '1234.56', expected: '1,234.6' },
        { state: '0.123', expected: '0.1' },
        { state: '1000000', expected: '1,000,000' },
      ];

      for (const testCase of testCases) {
        // Create entity with test state
        const entity = {
          ...mockEntity,
          state: testCase.state,
        };

        const result = createStatBox(
          mockElement,
          entity,
          mockSectionConfig,
          'Title',
          'Footer',
          'class',
          'mdi:icon',
        );

        // Render the template
        const el = await fixture(result as TemplateResult);

        // Check that the value is properly formatted
        const valueEl = el.querySelector('.stat-value');
        expect(valueEl?.textContent?.trim()).to.equal(testCase.expected);
      }
    });

    it('should handle missing section config', async () => {
      // Call with undefined section config
      const result = createStatBox(
        mockElement,
        mockEntity,
        undefined,
        'Title',
        'Footer',
        'class',
        'mdi:icon',
      );

      // Render the template
      const el = await fixture(result as TemplateResult);

      // Should still render, but action handlers should not be called or should be called with undefined
      expect(actionHandlerStub.calledWith(undefined)).to.be.true;
      expect(
        handleClickActionStub.calledWith(mockElement, undefined, mockEntity),
      ).to.be.true;
    });
  });
};
