import type { Config, EntityInformation } from '@/types';
import { getDevice } from '@delegates/retrievers/device';
import * as cardEntitiesModule from '@delegates/utils/card-entities';
import { getPiHole } from '@delegates/utils/get-pihole';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('get-pihole.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let getDeviceStub: sinon.SinonStub;
    let getDeviceEntitiesStub: sinon.SinonStub;
    let mockEntities: EntityInformation[];

    beforeEach(() => {
      // Create mock config
      mockConfig = {
        device_id: 'pi_hole_device_1',
        url: 'http://pi.hole',
      };

      // Mock Home Assistant instance
      mockHass = {} as unknown as HomeAssistant;

      // Set up device stub
      getDeviceStub = stub();
      (getDevice as any) = getDeviceStub;
      getDeviceStub.withArgs(mockHass, 'pi_hole_device_1').returns({
        id: 'pi_hole_device_1',
        name: 'Pi-hole',
        area_id: 'network',
      });
      getDeviceStub
        .withArgs(mockHass, 'non_existent_device')
        .returns(undefined);

      // Set up mock entities
      mockEntities = [
        {
          entity_id: 'sensor.pi_hole_dns_queries_today',
          translation_key: 'dns_queries_today',
          state: '10000',
          attributes: { friendly_name: 'DNS Queries Today' },
        },
        {
          entity_id: 'sensor.pi_hole_domains_blocked',
          translation_key: 'domains_blocked',
          state: '120000',
          attributes: { friendly_name: 'Domains Blocked' },
        },
        {
          entity_id: 'sensor.pi_hole_ads_percentage_blocked_today',
          translation_key: 'ads_percentage_blocked_today',
          state: '25.5',
          attributes: { friendly_name: 'Ads Percentage Blocked Today' },
        },
        {
          entity_id: 'binary_sensor.pi_hole_status',
          translation_key: 'status',
          state: 'on',
          attributes: { friendly_name: 'Status' },
        },
        {
          entity_id: 'switch.pi_hole_main_switch',
          translation_key: undefined,
          state: 'on',
          attributes: { friendly_name: 'Pi-hole Main Switch' },
        },
        {
          entity_id: 'update.pi_hole_v6_integration_update',
          translation_key: undefined,
          state: 'off',
          attributes: {
            friendly_name: 'Pi-hole Integration Update',
            installed_version: '1.0.0',
          },
        },
      ];

      // Set up entities stub
      getDeviceEntitiesStub = stub(cardEntitiesModule, 'getDeviceEntities');
      getDeviceEntitiesStub
        .withArgs(mockHass, 'pi_hole_device_1')
        .returns(mockEntities);
    });

    afterEach(() => {
      // Clean up stubs
      getDeviceEntitiesStub.restore();
    });

    it('should return undefined when device is not found', () => {
      const config = { ...mockConfig, device_id: 'non_existent_device' };
      const result = getPiHole(mockHass, config);
      expect(result).to.be.undefined;
    });

    it('should map entities to the device object correctly', () => {
      const result = getPiHole(mockHass, mockConfig);

      // Device should exist
      expect(result).to.exist;
      expect(result?.device_id).to.equal('pi_hole_device_1');

      // Check mapped entities
      expect(result?.dns_queries_today).to.deep.equal(mockEntities[0]);
      expect(result?.domains_blocked).to.deep.equal(mockEntities[1]);
      expect(result?.ads_percentage_blocked_today).to.deep.equal(
        mockEntities[2],
      );
      expect(result?.status).to.deep.equal(mockEntities[3]);

      // Switch should be mapped correctly
      expect(result?.switch_pi_hole).to.deep.equal(mockEntities[4]);

      // Integration update should be mapped correctly
      expect(result?.integration_update_available).to.deep.equal(
        mockEntities[5],
      );
    });

    it('should handle missing entities gracefully', () => {
      // Return an empty array of entities
      getDeviceEntitiesStub.withArgs(mockHass, 'pi_hole_device_1').returns([]);

      const result = getPiHole(mockHass, mockConfig);

      // Should still return a device object with just the device_id
      expect(result).to.exist;
      expect(result?.device_id).to.equal('pi_hole_device_1');

      // No entities should be mapped
      expect(result?.dns_queries_today).to.be.undefined;
      expect(result?.domains_blocked).to.be.undefined;
      expect(result?.switch_pi_hole).to.be.undefined;
    });

    it('should map entities based on translation_key', () => {
      // Add more entities with different translation keys
      const extendedEntities = [
        ...mockEntities,
        {
          entity_id: 'sensor.pi_hole_seen_clients',
          translation_key: 'seen_clients',
          state: '15',
          attributes: { friendly_name: 'Seen Clients' },
        },
        {
          entity_id: 'button.pi_hole_refresh_data',
          translation_key: 'action_refresh_data',
          state: '',
          attributes: { friendly_name: 'Refresh Data' },
        },
      ];

      getDeviceEntitiesStub
        .withArgs(mockHass, 'pi_hole_device_1')
        .returns(extendedEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Check additional mapped entities
      expect(result?.seen_clients?.entity_id).to.equal(
        'sensor.pi_hole_seen_clients',
      );
      expect(result?.action_refresh_data?.entity_id).to.equal(
        'button.pi_hole_refresh_data',
      );
    });

    it('should handle multiple switch entities correctly', () => {
      // Create two switch entities
      const entitiesWithSwitches = [
        {
          entity_id: 'switch.pi_hole_group_default',
          translation_key: 'group',
          state: 'on',
          attributes: { friendly_name: 'Group Default' },
        },
        {
          entity_id: 'switch.pi_hole_main',
          translation_key: undefined,
          state: 'on',
          attributes: { friendly_name: 'Pi-hole' },
        },
      ];

      getDeviceEntitiesStub
        .withArgs(mockHass, 'pi_hole_device_1')
        .returns(entitiesWithSwitches);

      const result = getPiHole(mockHass, mockConfig);

      // The named switch (translation_key: 'group') should be mapped correctly
      expect(result?.group_default?.entity_id).to.equal(
        'switch.pi_hole_group_default',
      );

      // The unnamed switch should be assigned to switch_pi_hole
      expect(result?.switch_pi_hole?.entity_id).to.equal('switch.pi_hole_main');
    });
  });
};
