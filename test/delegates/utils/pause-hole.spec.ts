import { formatSecondsToHHMMSS } from '@common/convert-time';
import { handlePauseClick } from '@delegates/utils/pause-hole';
import type { HomeAssistant } from '@hass/types';
import type { PiHoleDevice } from '@type/types';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('handle-pause-click.ts', () => {
    let mockHass: HomeAssistant;
    let mockDevice: PiHoleDevice;
    let callServiceStub: sinon.SinonStub;
    let formatTimeStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock HomeAssistant object with a callService stub
      callServiceStub = stub();
      mockHass = {
        callService: callServiceStub,
      } as unknown as HomeAssistant;

      // Create a mock device
      mockDevice = {
        device_id: 'pi_hole_device_1',
        sensors: [],
        switches: [],
        controls: [],
        updates: [],
      } as PiHoleDevice;

      // Create a stub for formatSecondsToHHMMSS
      formatTimeStub = stub();
      (formatSecondsToHHMMSS as unknown) = formatTimeStub;
    });

    afterEach(() => {
      // Restore stubs after each test
      callServiceStub.reset();
      formatTimeStub.reset();
    });

    it('should return a function that can be called later', () => {
      // Act
      const result = handlePauseClick(mockHass, mockDevice, 60);

      // Assert
      expect(result).to.be.a('function');

      // Verify that callService wasn't called yet
      expect(callServiceStub.called).to.be.false;
    });

    it('should call callService with correct parameters when the returned function is invoked', () => {
      // Arrange
      const duration = 300; // 5 minutes
      const formattedTime = '00:05:00';
      formatTimeStub.withArgs(duration).returns(formattedTime);

      // Act
      const pauseFunction = handlePauseClick(mockHass, mockDevice, duration);

      // Invoking the returned function should call the service
      pauseFunction();

      // Assert
      expect(formatTimeStub.calledOnceWith(duration)).to.be.true;
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[0]).to.equal('pi_hole_v6');
      expect(callServiceStub.firstCall.args[1]).to.equal('disable');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        device_id: 'pi_hole_device_1',
        duration: formattedTime,
      });
    });

    it('should format seconds correctly for different durations', () => {
      // Arrange
      const testCases = [
        { seconds: 60, formatted: '00:01:00' },
        { seconds: 300, formatted: '00:05:00' },
        { seconds: 3600, formatted: '01:00:00' },
      ];

      testCases.forEach(({ seconds, formatted }) => {
        // Reset stubs for each test case
        callServiceStub.reset();
        formatTimeStub.reset();

        // Setup formatTimeStub to return the expected formatted time
        formatTimeStub.withArgs(seconds).returns(formatted);

        // Act
        const pauseFunction = handlePauseClick(mockHass, mockDevice, seconds);
        pauseFunction();

        // Assert
        expect(formatTimeStub.calledOnceWith(seconds)).to.be.true;
        expect(callServiceStub.calledOnce).to.be.true;
        expect(callServiceStub.firstCall.args[2].duration).to.equal(formatted);
      });
    });

    it('should use the device_id from the provided device', () => {
      // Arrange
      const differentDevice = {
        ...mockDevice,
        device_id: 'different_device_id',
      };
      formatTimeStub.returns('00:01:00');

      // Act
      const pauseFunction = handlePauseClick(mockHass, differentDevice, 60);
      pauseFunction();

      // Assert
      expect(callServiceStub.firstCall.args[2].device_id).to.equal(
        'different_device_id',
      );
    });
  });
};
