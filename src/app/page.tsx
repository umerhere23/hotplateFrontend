"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import toast from "react-hot-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if user is already logged in
  useAuthRedirect()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    // Prototype: skip email check and go to next step
    setTimeout(() => {
      router.push(`/verify`)
    }, 500)
    setIsLoading(false)
  }

  return (
    <main className="flex min-h-screen bg-[#fff5f0]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4">
        <div className="w-full md:w-1/2 max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium mb-2">Welcome back!</h1>
              <p className="text-gray-500">Sign in to your {process.env.NEXT_PUBLIC_SITE_NAME} account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="chef@example.com"
                  className="border-[#e1e1e1] h-12"
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full bg-[#ec711e] hover:bg-[#d86518] text-white h-12 rounded-full flex items-center justify-center
                    ${isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                  `}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[#ec711e] hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:block w-full md:w-1/2 p-4">
          <div className="relative h-[500px] w-full">
            <Image
              src="/login-image.svg?height=800&width=800"
              alt="Chef cooking illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  )
}
