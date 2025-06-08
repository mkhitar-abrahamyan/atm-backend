export const validateNumber = (value: any): value is number => {
  return typeof value === "number" && !isNaN(value)
}

export const MAX_TRANSACTION_AMOUNT = 10_000

export class UserNotFoundError extends Error {}
export class InsufficientFundsError extends Error {}
export class InvalidInputError extends Error {}
export class SameUserTransferError extends Error {}

export const validateAmount = (amount: number): void => {
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > MAX_TRANSACTION_AMOUNT
  ) {
    throw new InvalidInputError("Invalid or excessive amount")
  }
}

export const validateUserId = (userId: number): void => {
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new InvalidInputError("Invalid user ID")
  }
}
