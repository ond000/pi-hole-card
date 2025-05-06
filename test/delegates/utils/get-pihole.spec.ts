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
): EntityInformation => ({
  entity_id,
  translation_key,
  state,
  attributes: { friendly_name: 'friendly name' },
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
        url: 'http://pi.hole',
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

    it('should map all update entities correctly', () => {
      // Create entities for all update cases
      const updateEntities = [
        createEntity('update.core_update_available', 'core_update_available'),
        createEntity('update.web_update_available', 'web_update_available'),
        createEntity('update.ftl_update_available', 'ftl_update_available'),
      ];

      getDeviceEntitiesStub.returns(updateEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify each update was mapped correctly
      expect(result?.core_update_available).to.deep.equal(updateEntities[0]);
      expect(result?.web_update_available).to.deep.equal(updateEntities[1]);
      expect(result?.ftl_update_available).to.deep.equal(updateEntities[2]);
    });

    it('should map switch and binary sensor entities correctly', () => {
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

    it('should handle special cases correctly (integration update and switch)', () => {
      // Create special case entities
      const integrationUpdateEntity = createEntity(
        'update.pi_hole_v6_integration_update',
        undefined,
        'off',
      );

      const switchEntity = createEntity('switch.pi_hole_main', undefined, 'on');

      getDeviceEntitiesStub.returns([integrationUpdateEntity, switchEntity]);

      const result = getPiHole(mockHass, mockConfig);

      // Verify special cases were handled correctly
      expect(result?.integration_update_available).to.deep.equal(
        integrationUpdateEntity,
      );
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
        createEntity('update.core_update_available', 'core_update_available'),

        // Switches & Binary Sensors
        createEntity('switch.group_default', 'group'),
        createEntity('binary_sensor.status', 'status'),

        // Special cases
        createEntity('update.pi_hole_v6_integration_update', undefined, 'off'),
        createEntity('switch.pi_hole_main', undefined, 'on'),
      ];

      getDeviceEntitiesStub.returns(allEntities);

      const result = getPiHole(mockHass, mockConfig);

      // Verify a sample of different entity types
      expect(result?.dns_queries_today).to.deep.equal(allEntities[0]);
      expect(result?.action_gravity).to.deep.equal(allEntities[2]);
      expect(result?.core_update_available).to.deep.equal(allEntities[3]);
      expect(result?.group_default).to.deep.equal(allEntities[4]);
      expect(result?.status).to.deep.equal(allEntities[5]);
      expect(result?.integration_update_available).to.deep.equal(
        allEntities[6],
      );
      expect(result?.switch_pi_hole).to.deep.equal(allEntities[7]);
    });
  });
};
