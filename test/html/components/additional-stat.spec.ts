import type { EntityInformation, SectionConfig } from '@/types';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import { createAdditionalStat } from '@html/components/additional-stat';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('additional-stat.ts', () => {
    let actionHandlerStub: sinon.SinonStub;
    let handleClickActionStub: sinon.SinonStub;
    let mockElement: HTMLElement;
    let mockEntity: EntityInformation;
    let mockConfig: SectionConfig;

    beforeEach(() => {
      // Create stubs for action handler functions
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {}, // Mock the bind method
        handleAction: () => {}, // Add any other methods that might be called
      });

      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
        // @ts-ignore
      ).returns(() => {});

      // Mock HTML element
      mockElement = document.createElement('div');

      mockConfig = {
        tap_action: {
          action: 'more-info',
        },
      };

      // Create a mock entity for testing
      mockEntity = {
        entity_id: 'sensor.test_sensor',
        state: '42',
        translation_key: 'test_sensor',
        attributes: {
          friendly_name: 'Test Sensor',
        },
      };
    });

    afterEach(() => {
      // Restore all stubs
      actionHandlerStub.restore();
      handleClickActionStub.restore();
    });

    it('should return nothing when entity is undefined', async () => {
      const result = createAdditionalStat(
        mockElement,
        mockConfig,
        undefined,
        'mdi:account',
        'Test Text',
      );

      // Check that nothing is returned when entity is undefined
      expect(result).to.equal(nothing);
    });

    it('should render additional stat with provided icon and text', async () => {
      // Create test data
      const icon = 'mdi:test-icon';
      const text = 'Test Stat Text';

      // Call createAdditionalStat function
      const result = createAdditionalStat(
        mockElement,
        mockConfig,
        mockEntity,
        icon,
        text,
      );

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
      const result = createAdditionalStat(
        mockElement,
        mockConfig,
        mockEntity,
        '',
        '',
      );

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
      const result = createAdditionalStat(
        mockElement,
        mockConfig,
        mockEntity,
        'mdi:icon',
        specialText,
      );

      const el = await fixture(result as TemplateResult);

      // Check that the text content is preserved
      const textEl = el.querySelector('span');
      expect(textEl?.textContent).to.equal(specialText);
    });

    it('should attach action handlers to the element', async () => {
      const result = createAdditionalStat(
        mockElement,
        mockConfig,
        mockEntity,
        'mdi:icon',
        'Test Text',
      );

      await fixture(result as TemplateResult);

      // Check that actionHandler was called
      expect(actionHandlerStub.calledOnce).to.be.true;
      expect(actionHandlerStub.firstCall.args[0]).to.equal(mockConfig);

      // Check that handleClickAction was called with the correct arguments
      expect(handleClickActionStub.calledOnce).to.be.true;
      expect(handleClickActionStub.firstCall.args[0]).to.equal(mockElement);
      expect(handleClickActionStub.firstCall.args[1]).to.equal(mockConfig);
      expect(handleClickActionStub.firstCall.args[2]).to.equal(mockEntity);
    });
  });
};
