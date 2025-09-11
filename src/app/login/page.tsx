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
import { useAppDispatch } from "@/store"
import { setUser } from "@/store/userSlice"
import { setAuth } from "@/store/authSlice"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useAppDispatch()
  type Step = "email" | "phone" | "code" | "verifying"
  const [step, setStep] = useState<Step>("email")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Redirect if user is already logged in
  useAuthRedirect()
  // Prefer NEXT_PUBLIC_API_URL, then BACKEND_URL, then localhost:3000
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:3000"
  const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Hotplate"

  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)

    try {
      // Check if the email exists in the system
      const response = await fetch(`${API_URL}/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Email not found")
      }

      // Store email and any user id safely
      localStorage.setItem("userEmail", data.email)
      const userIdFromApi = responseData?.data?.user_id
      if (userIdFromApi !== undefined && userIdFromApi !== null) {
        localStorage.setItem("userId", String(userIdFromApi))
      }

      // Prefill phone if backend returns one
      const phoneFromApi = responseData?.data?.phone_number ?? responseData?.data?.phone ?? ""
      if (typeof phoneFromApi === "string" && phoneFromApi) {
        setPhone(phoneFromApi)
      }

      toast.success("Email found! Please verify your phone.", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

      // Move to phone step
      setStep("phone")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Email not found. Please check your email or sign up.", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMockCode = () => {
    setErrorMsg(null)
    if (!phone || phone.trim().length < 6) {
      setErrorMsg("Enter a valid phone number")
      return
    }
    // Persist chosen phone
    localStorage.setItem("userPhone", phone)
    setOtpSent(true)
    setStep("code")
    toast.success("Code sent! Use 000000 to continue.")
  }

  const verifyMockCode = async () => {
    setErrorMsg(null)
    if (code !== "000000") {
      setErrorMsg("Invalid code. Use 000000")
      return
    }
    setIsLoading(true)
    setStep("verifying")
    try {
    // 1) Send email and OTP to backend (no phone)
      const email = localStorage.getItem("userEmail") || ""
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:3000"

      let authToken: string | undefined
      let tokenType: string | undefined
      try {
        const loginRes = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, otp: code }),
        })
    if (loginRes.ok) {
          const loginData = await loginRes.json().catch(() => ({}))
          const dataNode = loginData?.data || loginData
          authToken = dataNode?.token || dataNode?.access_token || loginData?.access_token
          tokenType = dataNode?.token_type || loginData?.token_type || 'Bearer'
          if (authToken) {
            localStorage.setItem("authToken", authToken)
            localStorage.setItem("tokenType", tokenType!)
            dispatch(setAuth({ token: authToken, tokenType }))
          }
          // If user object already in login response, store it immediately
          const loginUser = dataNode?.user
          if (loginUser) {
            dispatch(setUser(loginUser))
            // Also persist key fields
            if (loginUser.email) localStorage.setItem("userEmail", loginUser.email)
            if (loginUser.phoneNumber) localStorage.setItem("userPhone", loginUser.phoneNumber)
            if (loginUser.id) localStorage.setItem("userId", String(loginUser.id))
      toast.success("Signed in!")
      router.push("/dashboard")
      return
          }
        }
      } catch {}

      // 2) Fetch user info from backend before navigating
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" }
  if (authToken) headers["Authorization"] = `${tokenType || 'Bearer'} ${authToken}`

      const res = await fetch(`${API_URL}/me`, {
        headers,
        method: "GET",
      })
  const data = await res.json().catch(() => ({}))
      // Shape a minimal user object
  const user = data?.data?.user || data?.user || data?.data || {
        id: data?.id || "",
        email,
        phone: localStorage.getItem("userPhone") || "",
        ...data,
      }
      dispatch(setUser(user))
      toast.success("Signed in!")
      router.push("/dashboard")
    } catch (e) {
      // If fetch fails, still proceed but with minimal user
      const fallbackUser = {
        id: localStorage.getItem("userId") || "",
        email: localStorage.getItem("userEmail") || "",
        phone: localStorage.getItem("userPhone") || "",
      }
      dispatch(setUser(fallbackUser))
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-[#fff5f0]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4">
        <div className="w-full md:w-1/2 max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium mb-2">Welcome back!</h1>
              <p className="text-gray-500">Sign in to your {SITE_NAME} account</p>
            </div>

            {step === "email" && (
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
            )}

            {step === "phone" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +1 555 123 4567"
                    className="border-[#e1e1e1] h-12"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={sendMockCode}
                    disabled={isLoading}
                    className={`
                      w-full bg-[#ec711e] hover:bg-[#d86518] text-white h-12 rounded-full flex items-center justify-center
                      ${isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                    `}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                    ) : (
                      "Send code"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "code" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Enter code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="border-[#e1e1e1] h-12 text-center tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Use 000000 to continue</p>
                  {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={verifyMockCode}
                    disabled={isLoading || code.length !== 6}
                    className={`
                      w-full bg-[#ec711e] hover:bg-[#d86518] text-white h-12 rounded-full flex items-center justify-center
                      ${isLoading || code.length !== 6 ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                    `}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>
            )}

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
