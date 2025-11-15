
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validates an Ecuadorian ID number (Cédula).
 * @param id The ID number as a string.
 * @returns True if the ID is valid, false otherwise.
 */
export const validateEcuadorianId = (id: string): boolean => {
  if (typeof id !== 'string' || id.length !== 10 || !/^\d+$/.test(id)) {
    return false;
  }

  const provinceCode = parseInt(id.substring(0, 2), 10);
  if (provinceCode < 1 || provinceCode > 24) {
    // There are some special codes like 30 for people born abroad, but we'll stick to provinces for simplicity.
    return false;
  }

  const thirdDigit = parseInt(id[2], 10);
  if (thirdDigit >= 6) {
    return false;
  }

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let product = parseInt(id[i], 10) * coefficients[i];
    if (product >= 10) {
      product -= 9;
    }
    sum += product;
  }

  const verifierDigit = parseInt(id[9], 10);
  const calculatedVerifier = (sum % 10 === 0) ? 0 : 10 - (sum % 10);

  return verifierDigit === calculatedVerifier;
};
