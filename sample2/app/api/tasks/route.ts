import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Task from "@/models/task"
import { authMiddleware } from "@/middleware/auth"

// Get all tasks with pagination
export async function GET(req: Request) {
  try {
    const authResult = await authMiddleware(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const url = new URL(req.url)

    // Pagination parameters
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Status and priority filters
    const status = url.searchParams.get("status")
    const priority = url.searchParams.get("priority")

    // Build query
    const query: any = { user: userId }
    if (status) query.status = status
    if (priority) query.priority = priority

    await connectToDatabase()

    // Get tasks with pagination
    const tasks = await Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count for pagination info
    const total = await Task.countDocuments(query)

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new task
export async function POST(req: Request) {
  try {
    const authResult = await authMiddleware(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const { title, description, priority, status } = await req.json()

    // Validate input
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Create task
    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      status: status || "pending",
      user: userId,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

