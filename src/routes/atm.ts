import { Router, RequestHandler } from "express"
import AtmController from "../controllers/atmController"

const router = Router()

router.post("/withdraw", AtmController.withdraw as RequestHandler)
router.post("/deposit", AtmController.deposit as RequestHandler)
router.get("/balance/:userId", AtmController.getBalance as RequestHandler)
router.post("/transfer", AtmController.transfer as RequestHandler)
router.get(
  "/transactions/:userId",
  AtmController.getTransactions as RequestHandler
)

export default router
