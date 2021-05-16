/* eslint-disable capitalized-comments */
import BitMath from "./bit-math";
import { expect } from "chai";
import "mocha";
import faker from "faker";
import { performance } from "perf_hooks";

/**
 * Variables/Constants
 */
const RANDOM_NUMBER_COUNT = 10;
const RANDOM_FLOAT_MAX_DIGITS = 5;
const RANDOM_INT_MAX_LENGTH = 5;
const SPEED_COUNT_STEPS = [ 1000 ];

/**
 * Generate set of random floats
 */
function generateRandomFloats (amount: number = RANDOM_NUMBER_COUNT, seed: number = performance.now()): number[] {
  return new Array(amount).fill(0).map(() => {
    // Compute random digit amount
    const digits = seed % (RANDOM_FLOAT_MAX_DIGITS - 1) + 1;

    return faker.datatype.float({
      precision: Math.pow(10, -digits)
    });
  });
}


/**
 * Generate set of random (unsigned) integers
 */
function generateRandomIntegers (amount: number = RANDOM_NUMBER_COUNT): number[] {
  // Generate set of random integers
  let integers = new Array(amount).fill(0).map(() => {
    // Compute random digit amount
    return faker.datatype.number({
      min: 0,
      max: Math.pow(10, RANDOM_INT_MAX_LENGTH)
    });
  });

  // Randomly make integer negative or not
  integers = integers.map((i) => {
    return Math.random() > 0.5 ? -i : i;
  });

  return integers;
}

describe("BitMath operations should produce equal results to native equivalents", () => {
  // Test for BitMath.floor/Math.floor using floats
  describe("BitMath.floor() should equal Math.floor() using floating point numbers", () => {
    // Generate set of random integers
    const numbers = generateRandomFloats();

    // Iterate through generated random floats
    for (const number of numbers) {
      const mathFloor = Math.floor(number);
      const bitMathFloor = BitMath.floor(number);

      it(`${number}: "${mathFloor}" should be equal "${bitMathFloor}"`, () => {
        expect(mathFloor).to.equal(bitMathFloor);
      });
    }
  });

  // Test for BitMath.round/Math.round using floats
  describe("BitMath.round() should equal Math.round() using floating point numbers", () => {
    // Generate set of random integers
    const numbers = generateRandomFloats();

    // Iterate through generated random floats
    for (const number of numbers) {
      const mathRound = Math.round(number);
      const bitMathRound = BitMath.round(number);

      it(`${number}: "${mathRound}" should be equal "${bitMathRound}"`, () => {
        expect(mathRound).to.equal(bitMathRound);
      });
    }
  });

  // Test for BitMath.abs/Math.abs using integers only (floats aren't supported)
  describe("BitMath.abs() should equal Math.abs() using integers", () => {
    // Generate set of random floats
    const floats = generateRandomIntegers();

    // Iterate through generated random floats
    for (const float of floats) {
      const mathAbs = Math.abs(float);
      const bitMathAbs = BitMath.abs(float);

      it(`${float}: "${mathAbs}" should be equal "${bitMathAbs}"`, () => {
        expect(mathAbs).to.equal(bitMathAbs);
      });
    }
  });
});

describe("BitMath operations should be faster than native equivalents", () => {
  // Test for BitMath.floor/Math.floor
  describe("BitMath.floor() should be faster than Math.floor()", () => {
    // Generate set of random integers
    const seed = Date.now();
    faker.seed(seed);

    // Iterate threw speed count steps
    for (const step of SPEED_COUNT_STEPS) {
      const numbers = generateRandomFloats(step, seed);

      console.log(numbers);

      // Measure native performance
      const nativeBefore = performance.now();
      for (let number of numbers) {
        number = Math.floor(number);
      }
      const nativeAfter = performance.now();

      // Measure BitMath performance
      const bitBefore = performance.now();
      for (let number of numbers) {
        number = number << 0;
      }
      const bitAfter = performance.now();

      // Calculate delta for performance marks
      const deltaNative = nativeAfter - nativeBefore;
      const deltaBit = bitAfter - bitBefore;

      it(`(n=${step}): ${deltaBit}ms (BitMath) should be less than ${deltaNative}ms (native)`, () => {
        expect(deltaBit).to.lessThan(deltaNative);
      });
    }
  });

  // Test for BitMath.round/Math.round
  describe("BitMath.round() should be faster than Math.round()", () => {
    // Generate set of random integers
    const seed = Date.now();
    faker.seed(seed);

    // Iterate threw speed count steps
    for (const step of SPEED_COUNT_STEPS) {
      const numbers = generateRandomFloats(step, seed);

      // Measure native performance
      const nativeBefore = performance.now();
      for (let number of numbers) {
        number = Math.round(number);
      }
      const nativeAfter = performance.now();

      // Measure BitMath performance
      const bitBefore = performance.now();
      for (let number of numbers) {
        number = (((number + 0.5) << 1) >> 1);
      }
      const bitAfter = performance.now();

      // Calculate delta for performance marks
      const deltaNative = nativeAfter - nativeBefore;
      const deltaBit = bitAfter - bitBefore;

      it(`(n=${step}): ${deltaBit}ms (BitMath) should be less than ${deltaNative}ms (native)`, () => {
        expect(deltaBit).to.lessThan(deltaNative);
      });
    }
  });

  // Test for BitMath.abs/Math.abs
  describe("BitMath.abs() should be faster than Math.abs()", () => {
    // Generate set of random integers
    const seed = Date.now();
    faker.seed(seed);

    // Iterate threw speed count steps
    for (const step of SPEED_COUNT_STEPS) {
      const numbers = generateRandomIntegers(step);

      console.log(numbers);

      // Measure native performance
      const nativeBefore = performance.now();
      for (let number of numbers) {
        number = Math.abs(number);
      }
      const nativeAfter = performance.now();

      // Measure BitMath performance
      const bitBefore = performance.now();
      for (let number of numbers) {
        number = (number ^ (number >> 31)) - (number >> 31);
      }
      const bitAfter = performance.now();

      // Calculate delta for performance marks
      const deltaNative = nativeAfter - nativeBefore;
      const deltaBit = bitAfter - bitBefore;

      it(`(n=${step}): ${deltaBit}ms (BitMath) should be less than ${deltaNative}ms (native)`, () => {
        expect(deltaBit).to.lessThan(deltaNative);
      });
    }
  });
});