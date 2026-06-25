import { describe, expect, it } from 'vitest';

import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
} from '@/lib/registration-validators';
import type { RegistrationProfile } from '@/types';

// EXAMPLE unit tests for the pure per-step validators (Req 4–8, 11).
// Each suite checks that a fully-valid draft returns `{}` and that each rule
// violation places the expected field key in the returned error record.
//
// Sector ids below are real ids from src/data/sectors.ts.
const PRIMARY_SECTOR = 'deep-tech';
const SECONDARY_SECTORS = ['ai-ml', 'fintech', 'health-tech'];

describe('validateStep1 — founder details (Req 4)', () => {
  const valid: Partial<RegistrationProfile> = {
    founderName: 'Asha Rao',
    founderEmail: 'asha@example.com',
    founderPhone: '9876543210',
    founderAge: 30,
  };

  it('returns {} for a fully valid input', () => {
    expect(validateStep1(valid)).toEqual({});
  });

  it('flags a short founderName', () => {
    expect(validateStep1({ ...valid, founderName: 'A' })).toHaveProperty('founderName');
  });

  it('flags a malformed founderEmail', () => {
    expect(validateStep1({ ...valid, founderEmail: 'not-an-email' })).toHaveProperty(
      'founderEmail',
    );
  });

  it('flags a phone with the wrong digit count', () => {
    expect(validateStep1({ ...valid, founderPhone: '12345' })).toHaveProperty('founderPhone');
  });

  it('accepts a phone WITH a +91 prefix', () => {
    expect(validateStep1({ ...valid, founderPhone: '+919876543210' })).toEqual({});
  });

  it('flags an age below 18', () => {
    expect(validateStep1({ ...valid, founderAge: 17 })).toHaveProperty('founderAge');
  });

  it('flags an age above 80', () => {
    expect(validateStep1({ ...valid, founderAge: 81 })).toHaveProperty('founderAge');
  });
});

describe('validateStep2 — company basics (Req 5)', () => {
  // A safely-past incorporation date so the "not in the future" rule passes.
  const PAST_DATE = '2020-01-15';

  const valid: Partial<RegistrationProfile> = {
    companyName: 'Acme Innovations',
    dpiitRecognized: true,
    gstRegistered: false,
    incorporationDate: PAST_DATE,
    currentStage: 'Early Revenue',
  };

  it('returns {} for a fully valid input', () => {
    expect(validateStep2(valid)).toEqual({});
  });

  it('flags a short companyName', () => {
    expect(validateStep2({ ...valid, companyName: 'A' })).toHaveProperty('companyName');
  });

  it('flags a missing dpiitRecognized (undefined)', () => {
    expect(validateStep2({ ...valid, dpiitRecognized: undefined })).toHaveProperty(
      'dpiitRecognized',
    );
  });

  it('flags a missing gstRegistered (undefined)', () => {
    expect(validateStep2({ ...valid, gstRegistered: undefined })).toHaveProperty(
      'gstRegistered',
    );
  });

  it('flags an empty incorporationDate', () => {
    expect(validateStep2({ ...valid, incorporationDate: '' })).toHaveProperty(
      'incorporationDate',
    );
  });

  it('flags a FUTURE incorporationDate', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureIso = future.toISOString().slice(0, 10);
    expect(validateStep2({ ...valid, incorporationDate: futureIso })).toHaveProperty(
      'incorporationDate',
    );
  });

  it('accepts a same-day incorporationDate', () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    expect(validateStep2({ ...valid, incorporationDate: todayIso })).toEqual({});
  });

  it('flags an invalid currentStage', () => {
    expect(
      validateStep2({ ...valid, currentStage: 'Unicorn' as RegistrationProfile['currentStage'] }),
    ).toHaveProperty('currentStage');
  });
});

describe('validateStep3 — team composition (Req 6)', () => {
  const valid: Partial<RegistrationProfile> = {
    teamSize: 10,
    womenFounderStake: 50,
    womenEmployeePercentage: 40,
  };

  it('returns {} for a fully valid input', () => {
    expect(validateStep3(valid)).toEqual({});
  });

  it('flags teamSize of 0', () => {
    expect(validateStep3({ ...valid, teamSize: 0 })).toHaveProperty('teamSize');
  });

  it('flags teamSize of 5001', () => {
    expect(validateStep3({ ...valid, teamSize: 5001 })).toHaveProperty('teamSize');
  });

  it('accepts teamSize boundary of 1', () => {
    expect(validateStep3({ ...valid, teamSize: 1 })).toEqual({});
  });

  it('accepts teamSize boundary of 5000', () => {
    expect(validateStep3({ ...valid, teamSize: 5000 })).toEqual({});
  });

  it('flags a women founder stake below 0', () => {
    expect(validateStep3({ ...valid, womenFounderStake: -1 })).toHaveProperty(
      'womenFounderStake',
    );
  });

  it('flags a women founder stake above 100', () => {
    expect(validateStep3({ ...valid, womenFounderStake: 101 })).toHaveProperty(
      'womenFounderStake',
    );
  });
});

describe('validateStep4 — sector selection (Req 7)', () => {
  const valid: Partial<RegistrationProfile> = {
    primarySector: PRIMARY_SECTOR,
    secondarySectors: SECONDARY_SECTORS,
  };

  it('returns {} for a valid primary + secondary combo', () => {
    expect(validateStep4(valid)).toEqual({});
  });

  it('flags a missing primarySector', () => {
    expect(validateStep4({ secondarySectors: [] })).toHaveProperty('primarySector');
  });

  it('flags an invalid primarySector id', () => {
    expect(validateStep4({ ...valid, primarySector: 'not-a-sector' })).toHaveProperty(
      'primarySector',
    );
  });

  it('flags secondarySectors with length 4', () => {
    expect(
      validateStep4({
        ...valid,
        secondarySectors: ['ai-ml', 'fintech', 'health-tech', 'agri-tech'],
      }),
    ).toHaveProperty('secondarySectors');
  });

  it('flags secondarySectors that contain the primary sector', () => {
    expect(
      validateStep4({ ...valid, secondarySectors: [PRIMARY_SECTOR, 'ai-ml'] }),
    ).toHaveProperty('secondarySectors');
  });
});

describe('validateStep5 — location and funding (Req 8)', () => {
  const valid: Partial<RegistrationProfile> = {
    location: 'Bengaluru Urban',
    fundingStage: 'Seed',
    fundingRaised: 250,
  };

  it('returns {} for a fully valid combo', () => {
    expect(validateStep5(valid)).toEqual({});
  });

  it('flags an invalid location', () => {
    expect(
      validateStep5({ ...valid, location: 'Mumbai' as RegistrationProfile['location'] }),
    ).toHaveProperty('location');
  });

  it('flags an invalid fundingStage', () => {
    expect(
      validateStep5({
        ...valid,
        fundingStage: 'Series Z' as RegistrationProfile['fundingStage'],
      }),
    ).toHaveProperty('fundingStage');
  });

  it('flags a negative fundingRaised', () => {
    expect(validateStep5({ ...valid, fundingRaised: -1 })).toHaveProperty('fundingRaised');
  });
});
