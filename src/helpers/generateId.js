/**
 * Returns generated random string
 *
 * @param {number} length this is length of random string
 * @returns {string} result with random characters
 */
export default function generateId(length = 10) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!_-';
  const charactersLength = characters.length

  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));

  return result;
}
