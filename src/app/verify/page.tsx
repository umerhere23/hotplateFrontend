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
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [userId, setUserId] = useState("")
  const [step, setStep] = useState("loading") // loading, ready, code-sent, verifying
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if user is already logged in
  // useAuthRedirect()

  // Use a ref for the recaptcha container
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    // Get user data from localStorage
    const storedPhone = localStorage.getItem("userPhone")
    const storedUserId = localStorage.getItem("userId")

    if (storedPhone) {
      // Format phone number for Firebase (needs +country code)
      let formattedPhone = storedPhone
      if (!formattedPhone.startsWith("+")) {
        // If it starts with 1, assume US
        if (formattedPhone.startsWith("1")) {
          formattedPhone = `+${formattedPhone}`
        } else {
          formattedPhone = `+${formattedPhone}`
        }
      }
      setPhoneNumber(formattedPhone)
      console.log("Formatted phone number:", formattedPhone)
    } else {
      console.warn("No phone number found in localStorage")
      setErrorMessage("No phone number found. Please go back to the registration page.")
    }

    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      console.warn("No user ID found in localStorage")
    }

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
    // Clear any existing reCAPTCHA
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear()
      } catch (error) {
        console.error("Error clearing existing reCAPTCHA:", error)
      }
    }

    // Make sure we're in the browser environment
    if (typeof window !== "undefined" && recaptchaContainerRef.current) {
      try {
        console.log("Initializing reCAPTCHA...")

        // Create a new RecaptchaVerifier instance
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: "normal",
          callback: () => {
            // reCAPTCHA solved, allow sending verification code
            console.log("reCAPTCHA solved successfully")
            setStep("ready")
            setErrorMessage(null)
          },
          "expired-callback": () => {
            // Reset reCAPTCHA
            console.log("reCAPTCHA expired")
            toast.error("reCAPTCHA expired. Please solve it again.")
            setErrorMessage("reCAPTCHA expired. Please solve it again.")
            initRecaptcha()
          },
        })

        // Render the reCAPTCHA
        recaptchaVerifierRef.current
          .render()
          .then(() => {
            console.log("reCAPTCHA rendered successfully")
          })
          .catch((error) => {
            console.error("Error rendering reCAPTCHA:", error)
            setErrorMessage(`Failed to render reCAPTCHA: ${error.message}`)
            toast.error("Failed to load reCAPTCHA. Please refresh the page.")
          })
      } catch (error: any) {
        console.error("Error initializing reCAPTCHA:", error)
        setErrorMessage(`Failed to initialize reCAPTCHA: ${error.message}`)
        toast.error("Failed to initialize reCAPTCHA. Please refresh the page.")
      }
    } else {
      console.error("recaptchaContainerRef is not available or not in browser environment")
      setErrorMessage("reCAPTCHA container not found. Please refresh the page.")
    }
  }

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      const errorMsg = "Phone number is required"
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!recaptchaVerifierRef.current) {
      const errorMsg = "reCAPTCHA not initialized. Please refresh the page."
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log("Sending verification code to:", phoneNumber)
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current)
      console.log("Verification code sent successfully")
      setConfirmationResult(confirmation)
      setStep("code-sent")

      toast.success("Verification code sent to your phone!", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })
    } catch (error: any) {
      console.error("Error sending verification code:", error)
      const errorMsg = `Failed to send verification code: ${error.code || error.message}`
      setErrorMessage(errorMsg)
      toast.error(errorMsg, {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })

      // Reset reCAPTCHA
      initRecaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!confirmationResult) {
      const errorMsg = "Please request a verification code first"
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!verificationCode || verificationCode.length !== 6) {
      const errorMsg = "Please enter a valid 6-digit verification code"
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    setStep("verifying")
    setErrorMessage(null)

    try {
      // Confirm the verification code
      console.log("Verifying code:", verificationCode)
      const userCredential = await confirmationResult.confirm(verificationCode)
      console.log("Code verified successfully")

      // Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken()
      console.log("Got Firebase ID token")

      // Send the token to your backend to verify the user
      const response = await fetch(`${API_URL}/verify-firebase-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          firebase_token: idToken,
          user_id: userId,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Verification failed")
      }

      // Store authentication token
      localStorage.setItem("auth_token", responseData.data.access_token)

      toast.success("Phone verified successfully! Redirecting to dashboard...", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error verifying code:", error)
      const errorMsg = `Invalid verification code: ${error.code || error.message}`
      setErrorMessage(errorMsg)
      toast.error(errorMsg, {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
      setStep("code-sent") // Go back to code entry step
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-3xl font-medium mb-2">Verify Your Phone</h1>
              {/* Only show caption during loading and ready steps */}
              {(step === "loading" || step === "ready") && (
                <p className="text-gray-500">We need to verify your phone number</p>
              )}
              {phoneNumber && <p className="mt-2 font-medium text-gray-700">{phoneNumber}</p>}
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
                  Click the button below to send a verification code to your phone
                </p>
                <Button
                  onClick={sendVerificationCode}
                  disabled={isLoading}
                  className={`
                    w-full bg-[#ec711e] hover:bg-[#d86518] text-white h-12 rounded-full flex items-center justify-center
                    ${isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                  `}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>

                {/* Test button for development */}
                <div className="text-center mt-4">
                  <button onClick={useTestPhoneNumber} className="text-sm text-gray-500 underline">
                    Use test phone number
                  </button>
                </div>
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
