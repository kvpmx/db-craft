/**
 * Generate a random integer within a specified range.
 *
 * @param min - The minimum value of the range from which you want to generate a random number.
 * @param max - The maximum value that the random number generated should be less than or equal to.
 * @returns A random integer between the `min` and `max` values (inclusive).
 */
export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Select a random element from an array.
 *
 * @param array - An array of elements from which a random element will be chosen.
 * @returns An element from the input array.
 */
export const chooseRandom = <T>(array: readonly T[]) => {
  return array[getRandomNumber(0, array.length - 1)];
};
