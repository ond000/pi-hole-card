import type { Config } from '@/types';
import { PiHoleCardEditor } from '@cards/editor';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('editor.ts', () => {
    let card: PiHoleCardEditor;
    let hass: HomeAssistant;
    let dispatchStub: sinon.SinonStub;

    beforeEach(async () => {
      // Create mock HomeAssistant instance
      hass = {} as HomeAssistant;
      card = new PiHoleCardEditor();
      dispatchStub = stub(card, 'dispatchEvent');

      card.hass = hass;
    });

    afterEach(() => {
      dispatchStub.restore();
    });

    describe('initialization', () => {
      it('should be defined', () => {
        expect(card).to.be.instanceOf(PiHoleCardEditor);
      });

      it('should have default properties', () => {
        expect(card.hass).to.exist;
        expect(card['_config']).to.be.undefined;
      });
    });

    describe('setConfig', () => {
      it('should set the configuration correctly', () => {
        const testConfig: Config = {
          device_id: 'device_1',
        };

        card.setConfig(testConfig);
        expect(card['_config']).to.deep.equal(testConfig);
      });
    });

    describe('render', () => {
      it('should return nothing when hass is not set', async () => {
        card.hass = undefined as any;
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should return nothing when config is not set', async () => {
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should render ha-form when both hass and config are set', async () => {
        const testConfig: Config = {
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect(el.outerHTML).to.equal('<ha-form></ha-form>');
      });

      it('should pass correct props to ha-form', async () => {
        const testConfig: Config = {
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect((el as any).hass).to.deep.equal(hass);
        expect((el as any).data).to.deep.equal(testConfig);
        expect((el as any).schema).to.deep.equal([
          {
            name: 'device_id',
            selector: {
              device: {
                filter: {
                  integration: 'pi_hole_v6',
                },
              },
            },
            required: true,
            label: `Pi-hole Device`,
          },
          {
            name: 'url',
            selector: {
              text: {
                type: 'url',
              },
            },
            required: false,
            label: `Instance URL`,
          },
          {
            name: 'content',
            label: 'Content',
            type: 'expandable',
            flatten: true,
            icon: 'mdi:text-short',
            schema: [
              {
                name: 'title',
                required: false,
                label: 'Card Title',
                selector: {
                  text: {},
                },
              },
              {
                name: 'icon',
                required: false,
                label: 'Card Icon',
                selector: {
                  icon: {
                    placeholder: 'mdi:pi-hole',
                  },
                },
              },
            ],
          },
          {
            name: 'interactions',
            label: 'Interactions',
            type: 'expandable',
            flatten: true,
            icon: 'mdi:gesture-tap',
            schema: [
              {
                name: 'stats',
                label: 'Statistics',
                type: 'expandable',
                icon: 'mdi:counter',
                schema: [
                  {
                    name: 'tap_action',
                    label: 'Tap Action',
                    selector: {
                      ui_action: {},
                    },
                  },
                  {
                    name: 'hold_action',
                    label: 'Hold Action',
                    selector: {
                      ui_action: {},
                    },
                  },
                  {
                    name: 'double_tap_action',
                    label: 'Double Tap Action',
                    selector: {
                      ui_action: {},
                    },
                  },
                ],
              },
              {
                name: 'info',
                label: 'Information',
                type: 'expandable',
                icon: 'mdi:information-outline',
                schema: [
                  {
                    name: 'tap_action',
                    label: 'Tap Action',
                    selector: {
                      ui_action: {},
                    },
                  },
                  {
                    name: 'hold_action',
                    label: 'Hold Action',
                    selector: {
                      ui_action: {},
                    },
                  },
                  {
                    name: 'double_tap_action',
                    label: 'Double Tap Action',
                    selector: {
                      ui_action: {},
                    },
                  },
                ],
              },
              {
                name: 'controls',
                label: 'Controls',
                type: 'expandable',
                icon: 'mdi:remote',
                schema: [
                  {
                    name: 'tap_action',
                    label: 'Tap Action',
                    selector: {
                      ui_action: {
                        default_action: 'toggle' as const,
                      },
                    },
                  },
                  {
                    name: 'hold_action',
                    label: 'Hold Action',
                    selector: {
                      ui_action: {
                        default_action: 'more-info' as const,
                      },
                    },
                  },
                  {
                    name: 'double_tap_action',
                    label: 'Double Tap Action',
                    selector: {
                      ui_action: {
                        default_action: 'more-info' as const,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ]);
      });
    });

    describe('form behavior', () => {
      it('should compute labels correctly', async () => {
        const testConfig: Config = {
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        const computeLabelFn = (el as any).computeLabel;
        expect(computeLabelFn).to.be.a('function');

        // Test the compute label function
        const testSchema = { name: 'test', label: 'Test Label' };
        const result = computeLabelFn(testSchema);
        expect(result).to.equal('Test Label');
      });
    });

    describe('_valueChanged', () => {
      it('should fire config-changed event with config when features are present', () => {
        const testConfig: Config = {
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        // Simulate value-changed event
        const detail = {
          value: {
            device_id: 'device_1',
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched with correct data
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          device_id: 'device_1',
        });
      });

      it('should handle config without features property', () => {
        const testConfig: Config = {
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        // Simulate value-changed event without features
        const detail = {
          value: {
            device_id: 'device_1',
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched correctly
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          device_id: 'device_1',
        });
      });

      it('should remove object properties when object is empty', () => {
        const testConfig: Config = {
          device_id: 'device_1',
          stats: {},
          info: {},
          controls: {},
        };
        card.setConfig(testConfig);

        // Simulate value-changed event with empty arrays
        const detail = {
          value: {
            device_id: 'device_2',
            stats: {},
            info: {},
            controls: {},
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched with features property removed
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          device_id: 'device_2',
        });
        expect(dispatchStub.firstCall.args[0].detail.config.stats).to.be
          .undefined;
        expect(dispatchStub.firstCall.args[0].detail.config.info).to.be
          .undefined;
        expect(dispatchStub.firstCall.args[0].detail.config.controls).to.be
          .undefined;
      });
    });
  });
};
