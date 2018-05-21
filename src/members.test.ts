import { getUsername } from "./members";

const seedFn = () => 4;

describe("members", () => {
  describe("getUsername", () => {
    it("should construct a member id", () => {
      expect(getUsername("John Doe", seedFn)).toBe("john.doe.0000");
    });
    it("should handle multiple whitespaces", () => {
      expect(getUsername("  John   Doe  ", seedFn)).toBe("john.doe.0000");
    });
    it("should not handle no whitespaces", () => {
      expect(getUsername("JohnDoe", seedFn)).toBe("johndoe.0000");
    });
    it("should handle accents", () => {
      expect(getUsername("Crème Brûlée Coup de Grâce", seedFn)).toBe("creme.brulee.coup.de.grace.0000");
    });
    it("should handle some punctionation", () => {
      expect(getUsername("%%^^()Joh$n Doe-Deer", seedFn)).toBe("john.doe-deer.0000");
    });
  });
});
