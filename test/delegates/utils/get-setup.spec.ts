import * as getPiHoleModule from '@delegates/utils/get-pihole';
import { getPiSetup } from '@delegates/utils/get-setup';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { restore, stub } from 'sinon';

export default () => {
  describe('get-pi-setup.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let getPiHoleStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock HomeAssistant instance
      mockHass = {} as HomeAssistant;

      // Create mock config with a single device_id
      mockConfig = {
        device_id: 'pi_hole_device_1',
      };

      // Stub the getPiHole function
      getPiHoleStub = stub(getPiHoleModule, 'getPiHole');

      // Default behavior returns mock device for the first device ID
      getPiHoleStub.withArgs(mockHass, mockConfig, 'pi_hole_device_1').returns({
        device_id: 'pi_hole_device_1',
        sensors: [],
        switches: [],
        controls: [],
        updates: [],
      });

      // Default behavior returns undefined for this second device ID
      getPiHoleStub
        .withArgs(mockHass, mockConfig, 'non_existent_device')
        .returns(undefined);

      // Mock a second valid device
      getPiHoleStub.withArgs(mockHass, mockConfig, 'pi_hole_device_2').returns({
        device_id: 'pi_hole_device_2',
        sensors: [],
        switches: [],
        controls: [],
        updates: [],
      });
    });

    afterEach(() => {
      // Restore all stubs
      restore();
    });

    it('should handle a single device_id string', () => {
      // Arrange - using default mockConfig with single device_id

      // Act
      const result = getPiSetup(mockHass, mockConfig);

      // Assert
      expect(result).to.exist;
      expect(result?.holes).to.be.an('array').with.lengthOf(1);
      expect(result?.holes[0]?.device_id).to.equal('pi_hole_device_1');

      // Verify getPiHole was called exactly once with the correct parameters
      expect(getPiHoleStub.calledOnce).to.be.true;
      expect(getPiHoleStub.firstCall.args[0]).to.equal(mockHass);
      expect(getPiHoleStub.firstCall.args[1]).to.equal(mockConfig);
      expect(getPiHoleStub.firstCall.args[2]).to.equal('pi_hole_device_1');
    });

    it('should handle an array of device_ids', () => {
      // Arrange - update config to have multiple device IDs
      mockConfig.device_id = ['pi_hole_device_1', 'pi_hole_device_2'];

      // Act
      const result = getPiSetup(mockHass, mockConfig);

      // Assert
      expect(result).to.exist;
      expect(result?.holes).to.be.an('array').with.lengthOf(2);
      expect(result?.holes[0]?.device_id).to.equal('pi_hole_device_1');
      expect(result?.holes[1]?.device_id).to.equal('pi_hole_device_2');

      // Verify getPiHole was called twice with the correct parameters
      expect(getPiHoleStub.calledTwice).to.be.true;
      expect(getPiHoleStub.firstCall.args[2]).to.equal('pi_hole_device_1');
      expect(getPiHoleStub.secondCall.args[2]).to.equal('pi_hole_device_2');
    });

    it('should filter out non-existent devices', () => {
      // Arrange - config with mix of valid and invalid device IDs
      mockConfig.device_id = [
        'pi_hole_device_1',
        'non_existent_device',
        'pi_hole_device_2',
      ];

      // Act
      const result = getPiSetup(mockHass, mockConfig);

      // Assert
      expect(result).to.exist;
      expect(result?.holes).to.be.an('array').with.lengthOf(2);
      expect(result?.holes[0]?.device_id).to.equal('pi_hole_device_1');
      expect(result?.holes[1]?.device_id).to.equal('pi_hole_device_2');

      // Verify getPiHole was called three times but only two valid devices were returned
      expect(getPiHoleStub.calledThrice).to.be.true;
    });

    it('should return undefined if device_id array is empty', () => {
      // Arrange - config with empty device_id array
      const configWithEmptyDevices: Config = {
        ...mockConfig,
        device_id: [],
      };

      // Act
      const result = getPiSetup(mockHass, configWithEmptyDevices);

      // Assert
      expect(result).to.be.undefined;

      // Verify getPiHole was not called at all
      expect(getPiHoleStub.called).to.be.false;
    });

    it('should return empty holes array if all devices are invalid', () => {
      // Arrange - config with only invalid device IDs
      const configWithInvalidDevices: Config = {
        ...mockConfig,
        device_id: ['non_existent_device_1', 'non_existent_device_2'],
      };

      // Set up stub to return undefined for both device IDs
      getPiHoleStub
        .withArgs(mockHass, configWithInvalidDevices, 'non_existent_device_1')
        .returns(undefined);
      getPiHoleStub
        .withArgs(mockHass, configWithInvalidDevices, 'non_existent_device_2')
        .returns(undefined);

      // Act
      const result = getPiSetup(mockHass, configWithInvalidDevices);

      // Assert
      expect(result).to.exist;
      expect(result?.holes).to.be.an('array').with.lengthOf(0);

      // Verify getPiHole was called twice but no valid devices were found
      expect(getPiHoleStub.calledTwice).to.be.true;
    });
  });
};
