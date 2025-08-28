export class UserNotFoundException extends Error {
  constructor(userId: number) {
    super(`User with ID ${userId} not found.`);
  }
}
