import { NextResponse } from "next/server"

// This is a mock API route for testing without the Laravel backend
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Simulate validation
    if (!body.firstName || !body.lastName || !body.email || !body.phoneNumber) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Simulate email validation
    if (!body.email.includes("@")) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Signup successful",
      user: {
        id: "mock-id-" + Math.floor(Math.random() * 1000),
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Mock signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
