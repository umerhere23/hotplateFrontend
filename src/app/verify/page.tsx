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
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

export default function VerifyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState<"loading" | "ready" | "code-sent" | "verifying">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const SKIP_PHONE = process.env.NEXT_PUBLIC_SKIP_PHONE_VERIFICATION === "true"
  const FIREBASE_ENV_OK = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  )

  // Redirect if user is already logged in
  // useAuthRedirect()

  // reCAPTCHA
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    if (SKIP_PHONE) {
      // Skip full flow; allow direct continue
      setStep("ready")
      return
    }
    if (!FIREBASE_ENV_OK) {
      setErrorMessage(
        "Phone verification is not configured. Add Firebase env keys and enable Phone Auth + reCAPTCHA in Firebase Console."
      )
      setStep("ready")
      return
    }
    // Load initial phone from localStorage if available
    try {
      const storedPhone = typeof window !== "undefined" ? localStorage.getItem("userPhone") : null
      if (storedPhone) {
        setPhoneNumber(storedPhone.startsWith("+") ? storedPhone : `+${storedPhone}`)
      }
    } catch {}

    // Initialize reCAPTCHA when component mounts
    const timer = setTimeout(() => {
      initRecaptcha()
      setStep("ready")
    }, 500)

    // Clean up reCAPTCHA when component unmounts
    return () => {
      clearTimeout(timer)
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
  if (SKIP_PHONE) return
    if (!FIREBASE_ENV_OK) return
    if (recaptchaVerifierRef.current) {
      // Already initialized
      return
    }
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal", // visible for debugging; switch to 'invisible' later if desired
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          // reCAPTCHA expired
        },
      })
    } catch (error) {
      console.error("Failed to initialize reCAPTCHA:", error)
    }
  }

  const sendVerificationCode = async () => {
    if (SKIP_PHONE) {
      router.push("/dashboard")
      return
    }
    setErrorMessage(null)
    if (!phoneNumber) {
      setErrorMessage("Please enter your phone number.")
      return
    }

    // Ensure E.164 format with +
    const e164 = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`

    setIsLoading(true)
    try {
      if (!recaptchaVerifierRef.current) {
        initRecaptcha()
      }
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA is not ready. Please try again.")
      }

      const result = await signInWithPhoneNumber(auth, e164, recaptchaVerifierRef.current)
      setConfirmationResult(result)
      setStep("code-sent")
      toast.success(`Code sent to ${e164}`)
    } catch (error) {
      console.error("Error sending verification code:", error)
      const msg =
        (error as any)?.code === "auth/configuration-not-found"
          ? "Firebase Phone Auth reCAPTCHA configuration not found. In Firebase Console: enable Phone sign-in and set a Web reCAPTCHA key, and add your domain to Authorized domains."
          : error instanceof Error
            ? error.message
            : "Failed to send verification code"
      setErrorMessage(msg)
      // Reset captcha on failure
      try {
        recaptchaVerifierRef.current?.clear()
      } catch {}
      recaptchaVerifierRef.current = null
      initRecaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (SKIP_PHONE) {
      router.push("/dashboard")
      return
    }
    setErrorMessage(null)
    if (!confirmationResult) {
      setErrorMessage("Please request a code first.")
      return
    }
    if (verificationCode.length !== 6) {
      setErrorMessage("Please enter the 6-digit code.")
      return
    }

    setIsLoading(true)
    setStep("verifying")
    try {
      await confirmationResult.confirm(verificationCode)
      toast.success("Phone verified!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error verifying code:", error)
      setErrorMessage(error instanceof Error ? error.message : "Invalid verification code")
      setStep("code-sent")
    } finally {
      setIsLoading(false)
    }
  }

  // Optional: helper to prefill Firebase test number
  const useTestPhoneNumber = () => {
    setPhoneNumber("+16505553434") // Firebase test number must be E.164
    toast.success("Test phone number set: +1 650-555-3434")
  }

  return (
    <main className="flex min-h-screen bg-[#fff5f0]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4">
        <div className="w-full md:w-1/2 max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium mb-2">Verify your phone</h1>
              {(step === "loading") && (
                <p className="text-gray-500">Preparing verification...</p>
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

            {/* reCAPTCHA container (visible for debugging) */}
            {(step === "loading" || step === "ready") && (
              <div id="recaptcha-container" ref={recaptchaContainerRef} className="flex justify-center my-4" />
            )}


            {step === "ready" && (
              <div className="space-y-6">
                {SKIP_PHONE ? (
                  <>
                    <p className="text-center text-gray-600">Phone verification is skipped for now.</p>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      disabled={isLoading}
                      className={`
                        w-full bg-[#ec711e] hover:bg-[#d86518] text-white h-12 rounded-full flex items-center justify-center
                        ${isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                      `}
                    >
                      Continue
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone number
                      </Label>
                      <PhoneInput
                        country={"us"}
                        value={phoneNumber}
                        onChange={(value) => setPhoneNumber(value.startsWith("+") ? value : `+${value}`)}
                        inputProps={{
                          name: "phone",
                          required: true,
                          className:
                            "border-[#e1e1e1] h-12 w-full pl-[52px] rounded-md border",
                        }}
                        containerClass="allow-dropdown intl-tel-input relative"
                      />
                    </div>

                    <Button
                      onClick={sendVerificationCode}
                      disabled={isLoading || !phoneNumber}
                      className={`
                        w-full bg-[#ec711e] hover:bg-[#d86518] text-white h-12 rounded-full flex items-center justify-center
                        ${isLoading || !phoneNumber ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                      `}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                      ) : (
                        "Send code"
                      )}
                    </Button>

                    <div className="text-center">
                      <button onClick={useTestPhoneNumber} className="text-xs text-gray-500 underline">
                        Use Firebase test number
                      </button>
                    </div>
                  </>
                )}
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
                        try { recaptchaVerifierRef.current?.clear() } catch {}
                        recaptchaVerifierRef.current = null
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
