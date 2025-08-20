import { hasFeature } from '@config/feature';
import type { Config, Features } from '@type/config';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('feature', () => {
  it('should return true when config is null', () => {
    expect(hasFeature(null as any as Config, 'disable_group_pausing')).to.be
      .true;
  });

  it('should return true when config is undefined', () => {
    expect(hasFeature(undefined as any as Config, 'disable_group_pausing')).to
      .be.true;
  });

  it('should return false when config.features is undefined', () => {
    const config = {} as Config;
    expect(hasFeature(config, 'disable_group_pausing')).to.be.false;
  });

  it('should return false when config.features is empty', () => {
    const config = { device_id: '', features: [] } as Config;
    expect(hasFeature(config, 'disable_group_pausing')).to.be.false;
  });

  it('should return true when feature is present in config.features', () => {
    const config = {
      device_id: '',
      features: ['disable_group_pausing', 'exclude_default_entities'],
    } as Config;
    expect(hasFeature(config, 'disable_group_pausing')).to.be.true;
  });

  it('should return false when feature is not present in config.features', () => {
    const config = {
      device_id: '',
      features: ['fake_feature' as Features],
    } as Config;
    expect(hasFeature(config, 'disable_group_pausing')).to.be.false;
  });

  // Edge cases
  it('should handle empty string feature names', () => {
    const config = { features: ['' as any as Features] } as Config;
    expect(hasFeature(config, '' as any as Features)).to.be.true;
  });
});
