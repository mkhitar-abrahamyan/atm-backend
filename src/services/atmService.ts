import pool from "../db/index"

import { Transaction } from "../types/atm"
import {
  validateAmount,
  validateUserId,
  UserNotFoundError,
  InsufficientFundsError,
  SameUserTransferError,
} from "../utils"

export async function getBalance(userId: number): Promise<number> {
  validateUserId(userId)

  const { rows } = await pool.query<{ balance: number }>(
    "SELECT balance::numeric FROM users WHERE id = $1",
    [userId]
  )

  if (rows.length === 0) throw new UserNotFoundError("User not found")

  return rows[0].balance
}

export async function deposit(userId: number, amount: number): Promise<void> {
  validateUserId(userId)
  validateAmount(amount)

  const client = await pool.connect()

  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE")

    const { rows } = await client.query<{ id: number }>(
      "SELECT id FROM users WHERE id = $1 FOR UPDATE",
      [userId]
    )
    if (rows.length === 0) throw new UserNotFoundError("User not found")

    await client.query(
      "UPDATE users SET balance = balance + $1 WHERE id = $2",
      [amount, userId]
    )

    await client.query(
      `INSERT INTO transactions (user_id, type, amount) VALUES ($1, 'deposit', $2)`,
      [userId, amount]
    )

    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error(`Deposit error for user ${userId}:`, err)
    throw err
  } finally {
    client.release()
  }
}

export async function withdraw(userId: number, amount: number): Promise<void> {
  validateUserId(userId)
  validateAmount(amount)

  const client = await pool.connect()

  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE")

    const { rows } = await client.query<{ balance: number }>(
      "SELECT balance::numeric FROM users WHERE id = $1 FOR UPDATE",
      [userId]
    )
    if (rows.length === 0) throw new UserNotFoundError("User not found")

    const balance = rows[0].balance
    if (balance < amount) throw new InsufficientFundsError("Insufficient funds")

    await client.query(
      "UPDATE users SET balance = balance - $1 WHERE id = $2",
      [amount, userId]
    )

    await client.query(
      `INSERT INTO transactions (user_id, type, amount) VALUES ($1, 'withdraw', $2)`,
      [userId, amount]
    )

    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error(`Withdraw error for user ${userId}:`, err)
    throw err
  } finally {
    client.release()
  }
}

export async function transfer(
  fromUserId: number,
  toUserId: number,
  amount: number
): Promise<void> {
  validateUserId(fromUserId)
  validateUserId(toUserId)
  validateAmount(amount)

  if (fromUserId === toUserId)
    throw new SameUserTransferError("Cannot transfer to the same user")

  const client = await pool.connect()

  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE")

    const fromRes = await client.query<{ balance: number }>(
      "SELECT balance::numeric FROM users WHERE id = $1 FOR UPDATE",
      [fromUserId]
    )
    if (fromRes.rows.length === 0)
      throw new UserNotFoundError("Sender not found")
    const senderBalance = fromRes.rows[0].balance

    if (senderBalance < amount)
      throw new InsufficientFundsError("Insufficient funds")

    const toRes = await client.query<{ id: number }>(
      "SELECT id FROM users WHERE id = $1 FOR UPDATE",
      [toUserId]
    )
    if (toRes.rows.length === 0)
      throw new UserNotFoundError("Receiver not found")

    await client.query(
      "UPDATE users SET balance = balance - $1 WHERE id = $2",
      [amount, fromUserId]
    )
    await client.query(
      "UPDATE users SET balance = balance + $1 WHERE id = $2",
      [amount, toUserId]
    )

    await client.query(
      `INSERT INTO transactions (user_id, type, amount, target_user_id) VALUES ($1, 'transfer_out', $2, $3)`,
      [fromUserId, amount, toUserId]
    )
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, target_user_id) VALUES ($1, 'transfer_in', $2, $3)`,
      [toUserId, amount, fromUserId]
    )

    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    console.error(`Transfer error from ${fromUserId} to ${toUserId}:`, err)
    throw err
  } finally {
    client.release()
  }
}

export async function getTransactions(userId: number): Promise<Transaction[]> {
  validateUserId(userId)

  const { rows } = await pool.query<Transaction>(
    `SELECT id, type, amount, target_user_id, created_at
         FROM transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
             LIMIT 100`,
    [userId]
  )

  return rows
}
