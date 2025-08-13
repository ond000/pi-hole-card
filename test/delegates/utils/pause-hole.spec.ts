import { formatSecondsToHHMMSS } from '@common/convert-time';
import { handlePauseClick } from '@delegates/utils/pause-hole';
import type { HomeAssistant } from '@hass/types';
import type { PiHoleSetup } from '@type/types';
import { expect } from 'chai';
import { stub } from 'sinon';

  describe('handle-pause-click.ts', () => {
    let mockHass: HomeAssistant;
    let mockSetup: PiHoleSetup;
    let callServiceStub: sinon.SinonStub;
    let formatTimeStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock HomeAssistant object with a callService stub
      callServiceStub = stub();
      mockHass = {
        callService: callServiceStub,
      } as unknown as HomeAssistant;

      // Create a mock device
      mockSetup = {
        holes: [
          {
            device_id: 'pi_hole_device_1',
          },
        ],
      } as PiHoleSetup;

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
      const result = handlePauseClick(mockHass, mockSetup, 60);

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
      const pauseFunction = handlePauseClick(mockHass, mockSetup, duration);

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
        const pauseFunction = handlePauseClick(mockHass, mockSetup, seconds);
        pauseFunction();

        // Assert
        expect(formatTimeStub.calledOnceWith(seconds)).to.be.true;
        expect(callServiceStub.calledOnce).to.be.true;
        expect(callServiceStub.firstCall.args[2].duration).to.equal(formatted);
      });
    });
  });
