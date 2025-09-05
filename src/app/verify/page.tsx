"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import toast from "react-hot-toast"
import { auth } from "@/firebase/config"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"

export default function VerifyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  // Prototype: skip backend and Firebase logic
  // const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  // const [phoneNumber, setPhoneNumber] = useState("")
  // const [userId, setUserId] = useState("")
  const [step, setStep] = useState("ready") // Directly show ready step
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if user is already logged in
  // useAuthRedirect()

  // Use a ref for the recaptcha container
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
  // Prototype: skip fetching user data and backend logic

    // Initialize reCAPTCHA when component mounts
    setTimeout(() => {
      initRecaptcha()
    }, 1000) // Delay initialization to ensure DOM is ready

    // Clean up reCAPTCHA when component unmounts
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (error) {
          console.error("Error clearing reCAPTCHA:", error)
        }
      }
    }
  }, [])

  const initRecaptcha = () => {
  // Prototype: skip reCAPTCHA logic
  }

  const sendVerificationCode = async () => {
  // Prototype: skip sending verification code
  setStep("code-sent")
  }

  const verifyCode = async () => {
    // Prototype: skip code verification and backend
    setStep("verifying")
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  // For testing purposes - use a test phone number
  const useTestPhoneNumber = () => {
    setPhoneNumber("+1 650-555-3434") // Firebase test number
    toast.success("Test phone number set: +1 650-555-3434")
  }

  return (
    <main className="flex min-h-screen bg-[#fff5f0]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4">
        <div className="w-full md:w-1/2 max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium mb-2">Verify Prototype</h1>
              {(step === "loading" || step === "ready") && (
                <p className="text-gray-500">Prototype: skipping phone verification</p>
              )}
            </div>

            {/* Error message display */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p className="font-medium">Error:</p>
                <p>{errorMessage}</p>
              </div>
            )}

            {step === "loading" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ec711e] border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading verification...</p>
              </div>
            )}

            {/* This div will be used to render the reCAPTCHA */}
            {(step === "loading" || step === "ready") && (
              <div ref={recaptchaContainerRef} className="flex justify-center my-4"></div>
            )}


            {step === "ready" && (
              <div className="space-y-6">
                <p className="text-center text-gray-600 mb-4">
                  Prototype: skipping phone verification step
                </p>
                <Button
                  onClick={() => setStep("code-sent")}
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
            )}

            {step === "code-sent" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Enter Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    className="border-[#e1e1e1] h-12 text-center text-2xl tracking-widest"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">For test phone number +1 650-555-3434, use code: 123456</p>
                </div>

                <Button
                  onClick={verifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className={`
                    w-full bg-[#ec711e] hover:bg-[#d86518] text-white h-12 rounded-full flex items-center justify-center
                    ${isLoading || verificationCode.length !== 6 ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                  `}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                  ) : (
                    "Verify"
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-gray-600">
                    Didn't receive the code?{" "}
                    <button
                      onClick={() => {
                        initRecaptcha()
                        setStep("ready")
                      }}
                      disabled={isLoading}
                      className={`text-[#ec711e] hover:underline ${
                        isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            )}

            {step === "verifying" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ec711e] border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Verifying your code...</p>
              </div>
            )}
          </div>
        </div>
        <div className="hidden md:block w-full md:w-1/2 p-4">
          <div className="relative h-[500px] w-full">
            <Image
              src="/verify-image.svg?height=800&width=800"
              alt="Phone verification illustration"
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
