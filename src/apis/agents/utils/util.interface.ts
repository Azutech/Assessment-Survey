export function validatePassword(password: string) {
  // Regex to enforce the rules
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  // Test the password against the regex
  return regex.test(password);
}
