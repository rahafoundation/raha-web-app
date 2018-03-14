import { getMemberId, getPrefixFromMemberId, getSuffixFromMemberId } from './members'

const seedFn = () => { return 4 }

describe('members', () => {
  describe('getMemberId', () => {
    it('should construct a member id', () => {
      expect(getMemberId("John Doe", seedFn)).toBe("john.doe$0000");
    })
    it('should handle multiple whitespaces', () => {
      expect(getMemberId("  John   Doe  ", seedFn)).toBe("john.doe$0000");
    })
    it('should not handle no whitespaces', () => {
      expect(getMemberId("JohnDoe", seedFn)).toBe("johndoe$0000");
    })
  })
  describe('getSuffixFromMemberId', () => {
    it('should return the last 4 digits from a valid member id.', () => {
      expect(getSuffixFromMemberId('john.doe$0000')).toBe('0000');
    });
  });
  describe('getPrefixFromMemberId', () => {
    it('should return all but the last 5 characters from a valid member id.', () => {
      expect(getPrefixFromMemberId('john.doe$0000')).toBe('john.doe');
    });
  });
});
