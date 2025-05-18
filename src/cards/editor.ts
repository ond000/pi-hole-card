import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { Config, SectionConfig } from '@type/config';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';

const SCHEMA: HaFormSchema[] = [
  {
    name: 'device_id',
    selector: {
      device: {
        filter: [
          {
            integration: 'pi_hole_v6',
          },
          {
            integration: 'pi_hole',
          },
        ],
        multiple: true,
      },
    },
    required: true,
    label: `Pi-hole Device`,
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
    name: 'layout',
    label: 'Layout',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:view-grid-plus',
    schema: [
      {
        name: 'exclude_sections',
        label: 'Sections to exclude',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list' as const,
            options: [
              {
                label: 'Actions',
                value: 'actions',
              },
              {
                label: 'Footer',
                value: 'footer',
              },
              {
                label: 'Header',
                value: 'header',
              },
              {
                label: 'Pause Buttons',
                value: 'pause',
              },
              {
                label: 'Statistics',
                value: 'statistics',
              },
              {
                label: 'Sensors',
                value: 'sensors',
              },
              {
                label: 'Switches',
                value: 'switches',
              },
            ],
          },
        },
      },
      {
        name: 'collapsed_sections',
        label: 'Sections collapsed by default',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list' as const,
            options: [
              {
                label: 'Pause Buttons',
                value: 'pause',
              },
              {
                label: 'Buttons',
                value: 'buttons',
              },

              {
                label: 'Actions',
                value: 'actions',
              },
            ],
          },
        },
      },
      {
        name: 'exclude_entities',
        label: 'Entities to exclude',
        required: false,
        selector: {
          entity: {
            multiple: true,
            filter: [
              {
                integration: 'pi_hole_v6',
              },
              {
                integration: 'pi_hole',
              },
            ],
          },
        },
      },
      {
        name: 'entity_order',
        label: 'Entity display order (click in order)',
        required: false,
        selector: {
          entity: {
            multiple: true,
            filter: [
              {
                integration: 'pi_hole_v6',
                domain: ['button', 'sensor', 'switch'],
              },

              {
                integration: 'pi_hole',
                domain: ['button', 'sensor', 'switch'],
              },
            ],
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
        name: 'pause_durations',
        label: 'Pause durations',
        required: false,
        selector: {
          select: {
            multiple: true,
            custom_value: true,
            mode: 'list' as const,
            options: [
              {
                label: '60 seconds',
                value: '60',
              },
              {
                label: '5 minutes',
                value: '300',
              },
              {
                label: '15 minutes',
                value: '900',
              },
            ],
          },
        },
      },
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
    ],
  },
];

export class PiHoleCardEditor extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  public hass!: HomeAssistant;

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${(s: HaFormSchema) => s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = config;
  }

  private _valueChanged(ev: CustomEvent) {
    const config = ev.detail.value as Config;

    const shouldDelete = (obj: SectionConfig | undefined) =>
      obj &&
      (Object.keys(obj).length === 0 || Object.values(obj).some((f) => !f));

    if (shouldDelete(config.stats)) {
      delete config.stats;
    }
    if (shouldDelete(config.info)) {
      delete config.info;
    }
    if (shouldDelete(config.controls)) {
      delete config.controls;
    }

    if (!config.exclude_entities?.length) {
      delete config.exclude_entities;
    }

    if (!config.exclude_sections?.length) {
      delete config.exclude_sections;
    }

    if (!config.entity_order?.length) {
      delete config.entity_order;
    }

    if (!config.collapsed_sections?.length) {
      delete config.collapsed_sections;
    }

    // @ts-ignore
    fireEvent(this, 'config-changed', {
      config,
    });
  }
}
