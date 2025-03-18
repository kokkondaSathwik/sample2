import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Task from "@/models/task"
import { authMiddleware } from "@/middleware/auth"

// Get a single task
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await authMiddleware(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const taskId = params.id

    await connectToDatabase()

    const task = await Task.findOne({ _id: taskId, user: userId })
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a task
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await authMiddleware(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const taskId = params.id
    const { title, description, priority, status } = await req.json()

    await connectToDatabase()

    // Find task and check ownership
    const task = await Task.findOne({ _id: taskId, user: userId })
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        priority,
        status,
      },
      { new: true },
    )

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a task
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await authMiddleware(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const taskId = params.id

    await connectToDatabase()

    // Find task and check ownership
    const task = await Task.findOne({ _id: taskId, user: userId })
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Delete task
    await Task.findByIdAndDelete(taskId)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

