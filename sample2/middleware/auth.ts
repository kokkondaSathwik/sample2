import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function authMiddleware(req: NextRequest | Request) {
  try {
    // Get token from header
    const authHeader = req.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Unauthorized - No token provided" }
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string }

    return { success: true, userId: decoded.id }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return { success: false, error: "Unauthorized - Invalid token" }
  }
}

