import type { Config, EntityInformation } from '@/types';
import { getDevice } from '@delegates/retrievers/device';
import * as cardEntitiesModule from '@delegates/utils/card-entities';
import { getPiHole } from '@delegates/utils/get-pihole';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

// Helper to create entity objects with minimal required properties
const createEntity = (
  entity_id: string,
  translation_key: string | undefined,
  state: string = 'on',
  attributes: Record<string, any> = { friendly_name: 'friendly name' },
): EntityInformation => ({
  entity_id,
  translation_key,
  state,
  attributes,
});

export default () => {
  describe('get-pihole.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let getDeviceStub: sinon.SinonStub;
    let getDeviceEntitiesStub: sinon.SinonStub;
    let computeDomainStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock config
      mockConfig = {
        device_id: 'pi_hole_device_1',
      };

      // Mock Home Assistant instance
      mockHass = {} as unknown as HomeAssistant;

      // Set up stubs
      getDeviceStub = stub();
      (getDevice as any) = getDeviceStub;
      getDeviceStub.withArgs(mockHass, 'pi_hole_device_1').returns({
        id: 'pi_hole_device_1',
        name: 'Pi-hole',
      });
      getDeviceStub
        .withArgs(mockHass, 'non_existent_device')
        .returns(undefined);

      getDeviceEntitiesStub = stub(cardEntitiesModule, 'getDeviceEntities');

      computeDomainStub = stub();
      (computeDomain as any) = computeDomainStub;
      computeDomainStub.callsFake((entityId: string) => entityId.split('.')[0]);
    });

    afterEach(() => {
      getDeviceEntitiesStub.restore();
    });

    it('should return undefined when device is not found', () => {
      const config = { ...mockConfig, device_id: 'non_existent_device' };
      const result = getPiHole(mockHass, config);
      expect(result).to.be.undefined;
    });

    it('should map all sensor entities correctly', () => {
      // Create entities for all sensor cases
      const sensorEntities = [
        createEntity('sensor.dns_queries_today', 'dns_queries_today', '10000'),
        createEntity('sensor.domains_blocked', 'domains_blocked', '120000'),
        createEntity(
          'sensor.ads_percentage_blocked_today',
          'ads_percentage_blocked_today',
          '25.5',
        ),
        createEntity('sensor.ads_blocked_today', 'ads_blocked_today', '3500'),
        createEntity('sensor.seen_clients', 'seen_clients', '15'),
        createEntity('sensor.dns_unique_domains', 'dns_unique_domains', '5000'),
        createEntity('sensor.dns_queries_cached', 'dns_queries_cached', '2000'),
        createEntity(
          'sensor.dns_queries_forwarded',
          'dns_queries_forwarded',
          '8000',
        ),
        createEntity('sensor.dns_unique_clients', 'dns_unique_clients', '10'),
        createEntity(
          'sensor.remaining_until_blocking_mode',
          'remaining_until_blocking_mode',
          '30',
        ),
      ];

      getDeviceEntitiesStub.returns(sensorEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify each sensor was mapped correctly
      expect(result?.dns_queries_today).to.deep.equal(sensorEntities[0]);
      expect(result?.domains_blocked).to.deep.equal(sensorEntities[1]);
      expect(result?.ads_percentage_blocked_today).to.deep.equal(
        sensorEntities[2],
      );
      expect(result?.ads_blocked_today).to.deep.equal(sensorEntities[3]);
      expect(result?.seen_clients).to.deep.equal(sensorEntities[4]);
      expect(result?.dns_unique_domains).to.deep.equal(sensorEntities[5]);
      expect(result?.dns_queries_cached).to.deep.equal(sensorEntities[6]);
      expect(result?.dns_queries_forwarded).to.deep.equal(sensorEntities[7]);
      expect(result?.dns_unique_clients).to.deep.equal(sensorEntities[8]);
      expect(result?.remaining_until_blocking_mode).to.deep.equal(
        sensorEntities[9],
      );
    });

    it('should map all action button entities correctly', () => {
      // Create entities for all button cases
      const buttonEntities = [
        createEntity('button.action_flush_arp', 'action_flush_arp'),
        createEntity('button.action_flush_logs', 'action_flush_logs'),
        createEntity('button.action_gravity', 'action_gravity'),
        createEntity('button.action_restartdns', 'action_restartdns'),
        createEntity('button.action_refresh_data', 'action_refresh_data'),
      ];

      getDeviceEntitiesStub.returns(buttonEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify each button was mapped correctly
      expect(result?.action_flush_arp).to.deep.equal(buttonEntities[0]);
      expect(result?.action_flush_logs).to.deep.equal(buttonEntities[1]);
      expect(result?.action_gravity).to.deep.equal(buttonEntities[2]);
      expect(result?.action_restartdns).to.deep.equal(buttonEntities[3]);
      expect(result?.action_refresh_data).to.deep.equal(buttonEntities[4]);
    });

    it('should sort update entities by title with items without title at the end', () => {
      // Create update entities with different title attributes, intentionally out of order
      const updateEntities = [
        createEntity('update.pi_hole_web', undefined, 'off', {
          friendly_name: 'Pi-hole Web Update',
          title: 'Web Interface',
          installed_version: 'v5.17',
        }),
        createEntity('update.pi_hole_v6_integration', undefined, 'off', {
          friendly_name: 'Pi-hole Integration Update',
          // No title attribute
          installed_version: 'v2.0.0',
        }),
        createEntity('update.pi_hole_core', undefined, 'off', {
          friendly_name: 'Pi-hole Core Update',
          title: 'Core',
          installed_version: 'v5.14.2',
        }),
        createEntity('update.pi_hole_ftl', undefined, 'off', {
          friendly_name: 'Pi-hole FTL Update',
          title: 'FTL',
          installed_version: 'v5.21',
        }),
      ];

      // Set computeDomain to return "update" for these entities
      computeDomainStub.withArgs('update.pi_hole_core').returns('update');
      computeDomainStub.withArgs('update.pi_hole_ftl').returns('update');
      computeDomainStub.withArgs('update.pi_hole_web').returns('update');
      computeDomainStub
        .withArgs('update.pi_hole_v6_integration')
        .returns('update');

      getDeviceEntitiesStub.returns(updateEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify updates array exists and has 4 items
      expect(result?.updates).to.exist;
      expect(result?.updates?.length).to.equal(4);

      // Verify sorting order: Core, FTL, Web Interface, then ones without title
      expect(result?.updates?.[0]!.attributes.title).to.equal('Core');
      expect(result?.updates?.[1]!.attributes.title).to.equal('FTL');
      expect(result?.updates?.[2]!.attributes.title).to.equal('Web Interface');

      // The last one should be the one without a title attribute
      expect(result?.updates?.[3]!.entity_id).to.equal(
        'update.pi_hole_v6_integration',
      );
      expect(result?.updates?.[3]!.attributes.title).to.be.undefined;
    });

    it('should handle switch and binary sensor entities correctly', () => {
      // Create entities for switches and binary sensors
      const miscEntities = [
        createEntity('switch.group_default', 'group'),
        createEntity('binary_sensor.status', 'status'),
      ];

      getDeviceEntitiesStub.returns(miscEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify entities were mapped correctly
      expect(result?.group_default).to.deep.equal(miscEntities[0]);
      expect(result?.status).to.deep.equal(miscEntities[1]);
    });

    it('should handle the Pi-hole switch correctly', () => {
      // Create a switch entity
      const switchEntity = createEntity('switch.pi_hole_main', undefined, 'on');
      computeDomainStub.withArgs('switch.pi_hole_main').returns('switch');

      getDeviceEntitiesStub.returns([switchEntity]);

      const result = getPiHole(mockHass, mockConfig);

      // Verify the switch was mapped correctly
      expect(result?.switch_pi_hole).to.deep.equal(switchEntity);
    });

    it('should handle a combination of all entity types', () => {
      // Create a comprehensive set of entities covering all cases
      const allEntities = [
        // Sensors
        createEntity('sensor.dns_queries_today', 'dns_queries_today', '10000'),
        createEntity('sensor.domains_blocked', 'domains_blocked', '120000'),

        // Buttons
        createEntity('button.action_gravity', 'action_gravity'),

        // Updates
        createEntity('update.pi_hole_core', undefined, 'off', {
          friendly_name: 'Pi-hole Core Update',
          title: 'Core',
          installed_version: 'v5.14.2',
        }),
        createEntity('update.pi_hole_ftl', undefined, 'off', {
          friendly_name: 'Pi-hole FTL Update',
          title: 'FTL',
          installed_version: 'v5.21',
        }),

        // Switches & Binary Sensors
        createEntity('switch.group_default', 'group'),
        createEntity('binary_sensor.status', 'status'),

        // Main switch
        createEntity('switch.pi_hole_main', undefined, 'on'),
      ];

      // Set up computeDomain stubs for the specific tests
      computeDomainStub.withArgs('update.pi_hole_core').returns('update');
      computeDomainStub.withArgs('update.pi_hole_ftl').returns('update');
      computeDomainStub.withArgs('switch.pi_hole_main').returns('switch');

      getDeviceEntitiesStub.returns(allEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify a sample of different entity types
      expect(result?.dns_queries_today).to.deep.equal(allEntities[0]);
      expect(result?.action_gravity).to.deep.equal(allEntities[2]);
      expect(result?.group_default).to.deep.equal(allEntities[5]);
      expect(result?.status).to.deep.equal(allEntities[6]);
      expect(result?.switch_pi_hole).to.deep.equal(allEntities[7]);

      // Verify updates array
      expect(result?.updates).to.exist;
      expect(result?.updates?.length).to.equal(2);
      expect(result?.updates?.[0]!.attributes.title).to.equal('Core');
      expect(result?.updates?.[1]!.attributes.title).to.equal('FTL');
    });
  });
};
