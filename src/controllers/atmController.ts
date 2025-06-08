import { Request, Response, NextFunction } from "express"

import * as atmService from "../services/atmService"
import { validateNumber } from "../utils"

class AtmController {
  static async withdraw(req: Request, res: Response, next: NextFunction) {
    const { userId, amount } = req.body

    if (!validateNumber(userId) || !validateNumber(amount) || amount <= 0) {
      return res.status(400).json({
        error: "Invalid input: userId and amount must be positive numbers",
      })
    }

    try {
      await atmService.withdraw(userId, amount)
      res.status(200).json({
        success: true,
        message: `Withdrew ${amount} from user ${userId}`,
      })
    } catch (err: any) {
      if (err.message === "User not found")
        return res.status(404).json({ error: err.message })
      if (err.message === "Insufficient funds")
        return res.status(400).json({ error: err.message })

      next(err)
    }
  }

  static async deposit(req: Request, res: Response, next: NextFunction) {
    const { userId, amount } = req.body

    if (!validateNumber(userId) || !validateNumber(amount) || amount <= 0) {
      return res.status(400).json({
        error:
          "Invalid input: userId should be valid and amount must be positive number",
      })
    }

    try {
      await atmService.deposit(userId, amount)
      res.status(200).json({
        success: true,
        message: `Deposited ${amount} to user ${userId}`,
      })
    } catch (err: any) {
      if (err.message === "User not found")
        return res.status(404).json({ error: err.message })

      next(err)
    }
  }

  static async getBalance(req: Request, res: Response, next: NextFunction) {
    const userId = parseInt(req.params.userId, 10)
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: "Invalid userId" })
    }

    try {
      const balance = await atmService.getBalance(userId)
      res.status(200).json({ balance })
    } catch (err: any) {
      if (err.message === "User not found")
        return res.status(404).json({ error: err.message })

      next(err)
    }
  }

  static async transfer(req: Request, res: Response, next: NextFunction) {
    const { fromUserId, toUserId, amount } = req.body

    if (
      !validateNumber(fromUserId) ||
      !validateNumber(toUserId) ||
      !validateNumber(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        error: "Invalid input: user IDs and amount must be positive numbers",
      })
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: "Cannot transfer to the same user" })
    }

    try {
      await atmService.transfer(fromUserId, toUserId, amount)
      res.status(200).json({
        success: true,
        message: `Transferred ${amount} from user ${fromUserId} to user ${toUserId}`,
      })
    } catch (err: any) {
      if (
        err.message === "Sender not found" ||
        err.message === "Receiver not found"
      ) {
        return res.status(404).json({ error: err.message })
      }
      if (err.message === "Insufficient funds") {
        return res.status(400).json({ error: err.message })
      }

      next(err)
    }
  }

  static async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userId = parseInt(req.params.userId, 10)
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: "Invalid userId" })
    }

    try {
      const transactions = await atmService.getTransactions(userId)
      res.status(200).json({ transactions })
    } catch (err: any) {
      next(err)
    }
  }
}

export default AtmController
