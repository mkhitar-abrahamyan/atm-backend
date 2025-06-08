import express, { Request, Response, NextFunction } from "express"

import atmRoutes from "./routes/atm"

const app = express()
app.use(express.json())

/** In case of more routes use index.ts (inside routs) */
app.use("/atm", atmRoutes)

// Basic error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
