import { getState } from '@delegates/retrievers/state';
import { getDeviceEntities } from '@delegates/utils/card-entities';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('card-entities.ts', () => {
    let mockHass: HomeAssistant;
    let getStateStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock Home Assistant instance
      mockHass = {
        entities: {
          'sensor.pi_hole_dns_queries_today': {
            entity_id: 'sensor.pi_hole_dns_queries_today',
            device_id: 'pi_hole_device_1',
            translation_key: 'dns_queries_today',
          },
          'sensor.pi_hole_domains_blocked': {
            entity_id: 'sensor.pi_hole_domains_blocked',
            device_id: 'pi_hole_device_1',
            translation_key: 'domains_blocked',
          },
          'binary_sensor.pi_hole_status': {
            entity_id: 'binary_sensor.pi_hole_status',
            device_id: 'pi_hole_device_1',
            translation_key: 'status',
          },
          'update.pi_hole_v6_integration_update': {
            entity_id: 'update.pi_hole_v6_integration_update',
            device_id: 'some_other_device',
            translation_key: undefined,
          },
          'sensor.other_entity': {
            entity_id: 'sensor.other_entity',
            device_id: 'other_device',
            translation_key: undefined,
          },
        },
      } as unknown as HomeAssistant;

      // Stub the getState function
      getStateStub = stub();
      // Replace the imported getState with our stub
      (getState as any) = getStateStub;

      // Configure the stub behavior
      getStateStub
        .withArgs(mockHass, 'sensor.pi_hole_dns_queries_today')
        .returns({
          entity_id: 'sensor.pi_hole_dns_queries_today',
          state: '10000',
          attributes: {
            friendly_name: 'DNS Queries Today',
          },
        });

      getStateStub
        .withArgs(mockHass, 'sensor.pi_hole_domains_blocked')
        .returns({
          entity_id: 'sensor.pi_hole_domains_blocked',
          state: '120000',
          attributes: {
            friendly_name: 'Domains Blocked',
          },
        });

      getStateStub.withArgs(mockHass, 'binary_sensor.pi_hole_status').returns({
        entity_id: 'binary_sensor.pi_hole_status',
        state: 'on',
        attributes: {
          friendly_name: 'Status',
        },
      });

      getStateStub
        .withArgs(mockHass, 'update.pi_hole_v6_integration_update')
        .returns({
          entity_id: 'update.pi_hole_v6_integration_update',
          state: 'on',
          attributes: {
            friendly_name: 'Integration Update',
            installed_version: '1.0.0',
          },
        });

      getStateStub.withArgs(mockHass, 'sensor.other_entity').returns({
        entity_id: 'sensor.other_entity',
        state: 'value',
        attributes: {
          friendly_name: 'Other Entity',
        },
      });
    });

    afterEach(() => {
      // No need to restore since we're replacing the function directly
      // If we were using sandbox, we would restore here
    });

    it('should return correctly filtered entities for a device', () => {
      const deviceId = 'pi_hole_device_1';
      const entities = getDeviceEntities(mockHass, deviceId);

      // Should include entities from the device
      expect(entities).to.be.an('array');
      expect(entities.length).to.equal(4);

      // Should include the correct entities
      const entityIds = entities.map((e) => e.entity_id);
      expect(entityIds).to.include('sensor.pi_hole_dns_queries_today');
      expect(entityIds).to.include('sensor.pi_hole_domains_blocked');
      expect(entityIds).to.include('binary_sensor.pi_hole_status');
      expect(entityIds).to.include('update.pi_hole_v6_integration_update');
    });

    it('should include the integration update entity', () => {
      const deviceId = 'pi_hole_device_1';
      const entities = getDeviceEntities(mockHass, deviceId);

      // Should include the integration update entity even though it has a different device_id
      const updateEntity = entities.find(
        (e) => e.entity_id === 'update.pi_hole_v6_integration_update',
      );
      expect(updateEntity).to.exist;
      expect(updateEntity?.state).to.equal('on');
      expect(updateEntity?.attributes.installed_version).to.equal('1.0.0');
    });

    it('should filter out undefined state entities', () => {
      // Modify one stub to return undefined
      getStateStub
        .withArgs(mockHass, 'binary_sensor.pi_hole_status')
        .returns(undefined);

      const deviceId = 'pi_hole_device_1';
      const entities = getDeviceEntities(mockHass, deviceId);

      // Should not include the entity with undefined state
      const entityIds = entities.map((e) => e.entity_id);
      expect(entityIds).to.not.include('binary_sensor.pi_hole_status');
    });

    it('should handle empty entities object', () => {
      const emptyHass = { entities: {} } as unknown as HomeAssistant;
      const deviceId = 'pi_hole_device_1';
      const entities = getDeviceEntities(emptyHass, deviceId);

      expect(entities).to.be.an('array');
      expect(entities.length).to.equal(0);
    });

    it('should map entity properties correctly', () => {
      const deviceId = 'pi_hole_device_1';
      const entities = getDeviceEntities(mockHass, deviceId);

      // Check entity structure
      const dnsQueriesEntity = entities.find(
        (e) => e.entity_id === 'sensor.pi_hole_dns_queries_today',
      );
      expect(dnsQueriesEntity).to.exist;
      expect(dnsQueriesEntity?.translation_key).to.equal('dns_queries_today');
      expect(dnsQueriesEntity?.state).to.equal('10000');
      expect(dnsQueriesEntity?.attributes).to.deep.equal({
        friendly_name: 'DNS Queries Today',
      });
    });
  });
};
