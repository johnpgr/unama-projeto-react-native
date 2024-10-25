export function randomUserCode(maxLength: number) {
  // Ensure maxLength is a positive integer
  if (maxLength <= 0 || !Number.isInteger(maxLength)) {
    throw new Error("maxLength must be a positive integer.")
  }

  let result = ""
  for (let i = 0; i < maxLength; i++) {
    // Generate a random digit between 0 and 9
    const randomDigit = Math.floor(Math.random() * 10)
    result += randomDigit
  }

  return result
}
