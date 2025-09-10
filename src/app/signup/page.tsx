"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Instagram, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"

// Import react-intl-tel-input component and its styles
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import styles from "./page.module.css"

// Define food categories
const foodCategories = [
  "American",
  "Asian",
  "Bakery",
  "BBQ",
  "Breakfast",
  "Burgers",
  "Caribbean",
  "Desserts",
  "European",
  "Fast Food",
  "Healthy",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Pizza",
  "Seafood",
  "Smoothies & Juices",
  "Snacks",
  "Soup",
  "Thai",
  "Vegan",
  "Vegetarian",
  "Other",
]

// Define referral sources
const referralSources = [
  "Google Search",
  "Social Media",
  "Friend or Family",
  "Food Blog",
  "Advertisement",
  "Food Event",
  "Email Newsletter",
  "Restaurant Industry Connection",
  "Other",
]

// Step 1 schema
const step1Schema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number is required" })
    .refine(
      (value) => {
        // Remove all non-digit characters
        const digitsOnly = value.replace(/\D/g, "")
        // Check if it's a valid US number (10 digits, or 11 digits starting with 1)
        return digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith("1"))
      },
      { message: "Please enter a valid US phone number" },
    ),
})

// Step 2 schema
const step2Schema = z.object({
  isUSBased: z.enum(["yes", "no"], {
    required_error: "Please select if you're based in the US",
  }),
})

// Step 3 schema
const step3Schema = z.object({
  businessExperience: z.enum(["experienced", "beginner", "curious"], {
    required_error: "Please select your business experience",
  }),
  monthlySales: z.enum(["0-250", "250-1000", "1000-2500", "2500-5000", "5000-10000", "10000+"], {
    required_error: "Please select your monthly sales range",
  }),
  foodType: z.string({
    required_error: "Please select what kind of food you will sell",
  }),
})

// Step 4 schema
const step4Schema = z.object({
  instagramHandle: z.string().refine((val) => val === "NA" || val.startsWith("https://instagram.com/"), {
    message: "Please enter a valid Instagram URL (https://instagram.com/...) or NA",
  }),
  referralSource: z.string({
    required_error: "Please select how you heard about us",
  }),
  otherReferralSource: z.string().optional(),
})

// Step 5 schema
const step5Schema = z.object({
  businessName: z.string().min(2, { message: "Business name is required" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores and hyphens" }),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
})

// Combined form type
type FormValues = z.infer<typeof step1Schema> &
  z.infer<typeof step2Schema> &
  z.infer<typeof step3Schema> &
  z.infer<typeof step4Schema> &
  z.infer<typeof step5Schema>

// API URL (prefers NEXT_PUBLIC_API_URL, then BACKEND_URL, then localhost:3000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:3000"

// Debounce validation functions
const debounce = (func: (value: string) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout

  return (...args: [string]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export default function ChefOnboardingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<FormValues>>({})
  const [redirecting, setRedirecting] = useState(false)

  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    businessName?: string
    username?: string
    businessNameAvailable?: boolean
    usernameAvailable?: boolean
  }>({})
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null)
  const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null)
  const [instagramValidationError, setInstagramValidationError] = useState<string | null>(null)
  const [instagramValidated, setInstagramValidated] = useState(false)

  // Loading states for validation checks
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [isValidatingPhone, setIsValidatingPhone] = useState(false)
  const [isValidatingInstagram, setIsValidatingInstagram] = useState(false)
  const [isValidatingBusinessName, setIsValidatingBusinessName] = useState(false)
  const [isValidatingUsername, setIsValidatingUsername] = useState(false)

  // Redirect if user is already logged in
  useAuthRedirect()
  // Progress calculation
  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100
  // SITE_NAME with safe fallback to avoid calling toLocaleLowerCase on undefined
  const SITE_NAME = (process.env.NEXT_PUBLIC_SITE_NAME ?? "hotplate").toLocaleLowerCase()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Step 1 form
  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email || "",
      phoneNumber: formData.phoneNumber || "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  })

  // Step 2 form
  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      isUSBased: formData.isUSBased || undefined,
    },
  })

  // Step 3 form
  const step3Form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      businessExperience: formData.businessExperience || undefined,
      monthlySales: formData.monthlySales || undefined,
      foodType: formData.foodType || "",
    },
    mode: "onChange",
  })

  // Step 4 form
  const step4Form = useForm<z.infer<typeof step4Schema>>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      instagramHandle: formData.instagramHandle || "",
      referralSource: formData.referralSource || "",
      otherReferralSource: formData.otherReferralSource || "",
    },
    mode: "onChange",
  })

  // Step 5 form
  const step5Form = useForm<z.infer<typeof step5Schema>>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      businessName: formData.businessName || "",
      username: formData.username || "",
      termsAgreed: false, // Always start unchecked
    },
    mode: "onChange",
  }) 

  useEffect(() => {
    if (formData.termsAgreed === true) {
      step5Form.setValue("termsAgreed", true)
    }
  }, [formData, step5Form])

  // Check if step 1 form is valid and has no validation errors
  const isStep1Valid =
    step1Form.formState.isValid &&
    !emailValidationError &&
    !phoneValidationError &&
    !isValidatingEmail &&
    !isValidatingPhone

  // Check if step 3 form is valid
  const isStep3Valid = step3Form.formState.isValid

  // Check if step 4 form is valid and Instagram validation explicitly succeeded
  // instagramValidated must be true (set after successful server check or NA)
  const isStep4Valid = step4Form.formState.isValid && instagramValidated && !isValidatingInstagram

  // Check if step 5 form is valid and has no validation errors
  const isStep5Valid =
    step5Form.formState.isValid &&
    !validationErrors.businessName &&
    !validationErrors.username &&
    !isValidatingBusinessName &&
    !isValidatingUsername

  // Handle step 1 submission
  const onSubmitStep1 = (data: z.infer<typeof step1Schema>) => {
    if (emailValidationError || phoneValidationError || isValidatingEmail || isValidatingPhone) {
      return // Don't proceed if there are validation errors or validation is in progress
    }

    setFormData({ ...formData, ...data })
    setCurrentStep(2)
  }

  // Handle step 2 submission
  const onSubmitStep2 = (data: z.infer<typeof step2Schema>) => {
    setFormData({ ...formData, ...data })
    if (data.isUSBased === "yes") {
      setCurrentStep(3)
    }
    // If "no", the UI will show the "Oops" message and not proceed
  }

  // Handle step 3 submission
  const onSubmitStep3 = (data: z.infer<typeof step3Schema>) => {
    setFormData({ ...formData, ...data })
    setCurrentStep(4)
  }

  // Handle step 4 submission
  const onSubmitStep4 = (data: z.infer<typeof step4Schema>) => {
    if (instagramValidationError || isValidatingInstagram) {
      return // Don't proceed if there are validation errors or validation is in progress
    }

    setFormData({ ...formData, ...data })
    setCurrentStep(5)
  }

  // Handle final form submission
  const onSubmitStep5 = async (data: z.infer<typeof step5Schema>) => {
    if (
      validationErrors.businessName ||
      validationErrors.username ||
      isValidatingBusinessName ||
      isValidatingUsername
    ) {
      return // Don't proceed if there are validation errors or validation is in progress
    }

    setIsLoading(true)

    try {
      // Combine all form data
      const completeFormData = {
        ...formData,
        ...data,
      }

      // Submit data to Laravel API
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(completeFormData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Registration failed")
      }

      // Show success toast and direct user to login
      toast.success("Account created! Please log in.", {
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

      // Store user data in localStorage (optional)
      localStorage.setItem("userEmail", formData.email || "")
      localStorage.setItem("userPhone", formData.phoneNumber || "")
      if (responseData?.data?.user_id) {
        localStorage.setItem("userId", responseData.data.user_id.toString())
      }

      // Show redirecting screen
      setRedirecting(true)

      // Redirect to login page
      setTimeout(() => {
        router.push(`/login`)
      }, 2000)
    } catch (error) {
      console.error(error)

      // Show error toast
      toast.error(error instanceof Error ? error.message : "Oops! Something went wrong. Please try again.", {
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

  // Handle going back to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Watch for referral source to conditionally show "Other" input
  const referralSource = step4Form.watch("referralSource")
  const showOtherReferralInput = referralSource === "Other"

  // Function to validate business name
  const validateBusinessName = async (businessName: string) => {
    if (!businessName || businessName.length < 2) return

    setIsValidatingBusinessName(true)
    try {
      const response = await fetch(`${API_URL}/validate-business-name?business_name=${businessName}`)
      const data = await response.json()

      if (!data.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          businessName: data.message,
          businessNameAvailable: false,
        }))
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          businessName: undefined,
          businessNameAvailable: true,
        }))
      }
    } catch (error) {
      console.error("Error validating business name:", error)
      setValidationErrors((prev) => ({
        ...prev,
        businessName: "Error validating business name",
        businessNameAvailable: false,
      }))
    } finally {
      setIsValidatingBusinessName(false)
    }
  }

  // Function to validate username
  const validateUsername = async (username: string) => {
    if (!username || username.length < 3) return

    setIsValidatingUsername(true)
    try {
      const response = await fetch(`${API_URL}/validate-username?username=${username}`)
      const data = await response.json()

      if (!data.isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          username: data.message,
          usernameAvailable: false,
        }))
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          username: undefined,
          usernameAvailable: true,
        }))
      }
    } catch (error) {
      console.error("Error validating username:", error)
      setValidationErrors((prev) => ({
        ...prev,
        username: "Error validating username",
        usernameAvailable: false,
      }))
    } finally {
      setIsValidatingUsername(false)
    }
  }

  // Function to validate email
  const validateEmail = async (email: string) => {
    if (!email || !email.includes("@")) return

    setIsValidatingEmail(true)
    try {
      const response = await fetch(`${API_URL}/validate/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!data.success) {
        setEmailValidationError(data.message)
      } else {
        setEmailValidationError(null)
      }
    } catch (error) {
      console.error("Error validating email:", error)
      setEmailValidationError("Error checking email availability")
    } finally {
      setIsValidatingEmail(false)
    }
  }

  // Function to validate phone number
  const validatePhoneNumber = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) return

    setIsValidatingPhone(true)
    try {
      const response = await fetch(`${API_URL}/validate/phoneNumber`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (!data.success) {
        setPhoneValidationError(data.message)
      } else {
        setPhoneValidationError(null)
      }
    } catch (error) {
      console.error("Error validating phone number:", error)
      setPhoneValidationError("Error checking phone number availability")
    } finally {
      setIsValidatingPhone(false)
    }
  }

  // Function to validate Instagram handle
  const validateInstagramHandle = async (instagramHandle: string) => {
    if (!instagramHandle) return

    // Treat explicit NA as valid (no Instagram)
    if (instagramHandle === "https://instagram.com/NA") {
      setInstagramValidationError(null)
      setInstagramValidated(true)
      return
    }

    setIsValidatingInstagram(true)
    setInstagramValidated(false)
    try {
      const response = await fetch(`${API_URL}/validate/instagramHandle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instagramHandle }),
      })

      const data = await response.json()

      if (!data.success) {
        setInstagramValidationError(data.message)
        setInstagramValidated(false)
      } else {
        setInstagramValidationError(null)
        setInstagramValidated(true)
      }
    } catch (error) {
      console.error("Error validating Instagram handle:", error)
      setInstagramValidationError("Error checking Instagram handle availability")
      setInstagramValidated(false)
    } finally {
      setIsValidatingInstagram(false)
    }
  }

  // Add debounced versions of these functions
  const debouncedValidateEmail = useCallback(debounce(validateEmail, 500), [])
  const debouncedValidatePhoneNumber = useCallback(debounce(validatePhoneNumber, 500), [])
  const debouncedValidateInstagramHandle = useCallback(debounce(validateInstagramHandle, 500), [])
  const debouncedValidateBusinessName = useCallback(debounce(validateBusinessName, 500), [])
  const debouncedValidateUsername = useCallback(debounce(validateUsername, 500), [])

  // Redirecting screen
  if (redirecting) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-[#ec711e] mx-auto mb-6" />
          <h2 className="text-2xl font-medium mb-2">Redirecting you to verification page...</h2>
          <p className="text-gray-500">Please wait while we set up your account.</p>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <main className="flex min-h-screen bg-[#fff5f0]">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4">
          <div className="w-full md:w-1/2 max-w-md">
            <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-medium mb-2">Hi chef!</h1>
                <h2 className="text-2xl font-medium mb-4">Let&apos;s get started.</h2>
                <p className="text-gray-500">Tell us a bit about yourself.</p>
              </div>
              {/* Simplified form placeholders for server render */}
              <div className="space-y-4">
                <div className="h-12 border border-[#e1e1e1] rounded-md"></div>
                <div className="h-12 border border-[#e1e1e1] rounded-md"></div>
                <div className="h-12 border border-[#e1e1e1] rounded-md"></div>
                <div className="h-12 border border-[#e1e1e1] rounded-md"></div>
                <div className="pt-4">
                  <div className="w-full h-12 bg-[#ec711e] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block w-full md:w-1/2 p-4">
            <div className="relative h-[500px] w-full">
              {/* No Image component on server render */}
              <div className="h-full w-full bg-gray-100 rounded-md"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen bg-[#fff5f0]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4">
        <div className="w-full md:w-1/2 max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-10">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ec711e] transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-500 text-right">
                Step {currentStep} of {totalSteps}
              </div>
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-medium mb-2">Hi chef!</h1>
                  <h2 className="text-2xl font-medium mb-4">Let&apos;s get started.</h2>
                  <p className="text-gray-500">Tell us a bit about yourself.</p>
                </div>
                <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-4">
                  <div>
                    <Input
                      {...step1Form.register("firstName")}
                      placeholder="First name *"
                      className="border-[#e1e1e1] h-12"
                      aria-invalid={step1Form.formState.errors.firstName ? "true" : "false"}
                    />
                    {step1Form.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      {...step1Form.register("lastName")}
                      placeholder="Last name *"
                      className="border-[#e1e1e1] h-12"
                      aria-invalid={step1Form.formState.errors.lastName ? "true" : "false"}
                    />
                    {step1Form.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Input
                        {...step1Form.register("email", {
                          onChange: (e) => debouncedValidateEmail(e.target.value),
                        })}
                        placeholder="Email *"
                        type="email"
                        className={`border-[#e1e1e1] h-12 ${emailValidationError ? "border-red-500" : ""}`}
                        aria-invalid={step1Form.formState.errors.email || emailValidationError ? "true" : "false"}
                      />
                      {isValidatingEmail && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    {step1Form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.email.message}</p>
                    )}
                    {emailValidationError && <p className="text-red-500 text-sm mt-1">{emailValidationError}</p>}
                  </div>

                  <div>
                    {/* Using Controller for react-intl-tel-input */}
                    <div className="relative">
                      <Controller
                        control={step1Form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <PhoneInput
                            onlyCountries={["us", "pk", "in"]}
                            inputProps={{
                              name: field.name,
                              required: true,
                              className: `border-[#e1e1e1] h-12 w-full pl-[52px] rounded-md border ${phoneValidationError ? "border-red-500" : ""}`,
                              autoFocus: false,
                            }}
                            country={"us"}
                            containerClass={`allow-dropdown intl-tel-input ${styles.reactTelInput} relative`}
                            inputClass={styles.input}
                            dropdownClass={styles.dropdown}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              debouncedValidatePhoneNumber(value)
                            }}
                          />
                        )}
                      />
                      {isValidatingPhone && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    {step1Form.formState.errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.phoneNumber.message}</p>
                    )}
                    {phoneValidationError && <p className="text-red-500 text-sm mt-1">{phoneValidationError}</p>}
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={!isStep1Valid}
                      className={`w-full ${
                        !isStep1Valid ? "bg-gray-400 cursor-not-allowed" : "bg-[#ec711e] hover:bg-[#d86518]"
                      } text-white h-12 rounded-full flex items-center justify-center`}
                    >
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: US-based Check */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-medium mb-4">Location Check</h1>
                  <p className="text-gray-500">We need to know where you're based.</p>
                </div>
                <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-6">
                  <div className="space-y-4">
                    <Controller
                      control={step2Form.control}
                      name="isUSBased"
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-3"
                        >
                          <div className="flex items-center space-x-3 border border-[#e1e1e1] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <RadioGroupItem value="yes" id="us-yes" className="text-[#ec711e]" />
                            <Label htmlFor="us-yes" className="flex-1 cursor-pointer font-medium">
                              Yes, I'm based in the US
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 border border-[#e1e1e1] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <RadioGroupItem value="no" id="us-no" className="text-[#ec711e]" />
                            <Label htmlFor="us-no" className="flex-1 cursor-pointer font-medium">
                              No, I'm based outside the US
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                    {step2Form.formState.errors.isUSBased && (
                      <p className="text-red-500 text-sm mt-1">{step2Form.formState.errors.isUSBased.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-12 rounded-full border-[#e1e1e1]"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!step2Form.formState.isValid}
                      className={`flex-1 ${
                        !step2Form.formState.isValid
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#ec711e] hover:bg-[#d86518]"
                      } text-white h-12 rounded-full`}
                    >
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>

                {/* Show error message if user selects "No" */}
                {step2Form.watch("isUSBased") === "no" && (
                  <div className="mt-8 p-6 bg-red-50 rounded-lg border border-red-100 text-center">
                    <h2 className="text-3xl font-bold text-red-600 mb-4">Oooopsss!</h2>
                    <p className="text-lg text-red-700">
                      We're sorry, but our service is currently only available in the US region.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Business Information */}
            {currentStep === 3 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-medium mb-4">Your Business</h1>
                  <p className="text-gray-500">Tell us about your food business.</p>
                </div>
                <form onSubmit={step3Form.handleSubmit(onSubmitStep3)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="businessExperience" className="text-sm font-medium">
                      How seasoned is your business?
                    </Label>
                    <Controller
                      control={step3Form.control}
                      name="businessExperience"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-[#e1e1e1] h-12">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="experienced">Experienced: Existing food business</SelectItem>
                            <SelectItem value="beginner">Beginner: New in food business</SelectItem>
                            <SelectItem value="curious">Curious: About to start</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {step3Form.formState.errors.businessExperience && (
                      <p className="text-red-500 text-sm mt-1">
                        {step3Form.formState.errors.businessExperience.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlySales" className="text-sm font-medium">
                      How much do you sell per month?
                    </Label>
                    <Controller
                      control={step3Form.control}
                      name="monthlySales"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-[#e1e1e1] h-12">
                            <SelectValue placeholder="Select your monthly sales range" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="0-250">$0 - $250</SelectItem>
                            <SelectItem value="250-1000">$250 - $1,000</SelectItem>
                            <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                            <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                            <SelectItem value="10000+">$10,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {step3Form.formState.errors.monthlySales && (
                      <p className="text-red-500 text-sm mt-1">{step3Form.formState.errors.monthlySales.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foodType" className="text-sm font-medium">
                      What kind of food will you sell?
                    </Label>
                    <Controller
                      control={step3Form.control}
                      name="foodType"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-[#e1e1e1] h-12">
                            <SelectValue placeholder="Select food category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {foodCategories.map((category) => (
                              <SelectItem key={category} value={category.toLowerCase()}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {step3Form.formState.errors.foodType && (
                      <p className="text-red-500 text-sm mt-1">{step3Form.formState.errors.foodType.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-12 rounded-full border-[#e1e1e1]"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isStep3Valid}
                      className={`flex-1 ${
                        !isStep3Valid ? "bg-gray-400 cursor-not-allowed" : "bg-[#ec711e] hover:bg-[#d86518]"
                      } text-white h-12 rounded-full`}
                    >
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 4: Social Media and Referral */}
            {currentStep === 4 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-medium mb-4">Social & Referral</h1>
                  <p className="text-gray-500">Tell us how to find you online.</p>
                </div>
                <form onSubmit={step4Form.handleSubmit(onSubmitStep4)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="instagramHandle" className="text-sm font-medium flex items-center">
                      <Instagram className="h-4 w-4 mr-2 text-[#ec711e]" />
                      What's the Instagram for your business?
                    </Label>
                    <div className="relative">
                      <Input
                        {...step4Form.register("instagramHandle", {
                          onChange: (e) => debouncedValidateInstagramHandle(e.target.value),
                        })}
                        placeholder="https://instagram.com/yourbusiness"
                        className={`border-[#e1e1e1] h-12 ${instagramValidationError ? "border-red-500" : ""}`}
                      />
                      {isValidatingInstagram && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter https://instagram.com/NA if you don't have an Instagram account
                    </p>
                    {step4Form.formState.errors.instagramHandle && (
                      <p className="text-red-500 text-sm mt-1">{step4Form.formState.errors.instagramHandle.message}</p>
                    )}
                    {instagramValidationError && (
                      <p className="text-red-500 text-sm mt-1">{instagramValidationError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralSource" className="text-sm font-medium">
                      How did you hear about us?
                    </Label>
                    <Controller
                      control={step4Form.control}
                      name="referralSource"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="border-[#e1e1e1] h-12">
                            <SelectValue placeholder="Select referral source" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {referralSources.map((source) => (
                              <SelectItem key={source} value={source.toLowerCase()}>
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {step4Form.formState.errors.referralSource && (
                      <p className="text-red-500 text-sm mt-1">{step4Form.formState.errors.referralSource.message}</p>
                    )}
                  </div>

                  {/* Conditional field for "Other" referral source */}
                  {showOtherReferralInput && (
                    <div className="space-y-2">
                      <Label htmlFor="otherReferralSource" className="text-sm font-medium">
                        Please specify:
                      </Label>
                      <Input
                        {...step4Form.register("otherReferralSource")}
                        placeholder="Tell us how you heard about us"
                        className="border-[#e1e1e1] h-12"
                      />
                    </div>
                  )}

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-12 rounded-full border-[#e1e1e1]"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isStep4Valid}
                      className={`flex-1 ${
                        !isStep4Valid ? "bg-gray-400 cursor-not-allowed" : "bg-[#ec711e] hover:bg-[#d86518]"
                      } text-white h-12 rounded-full`}
                    >
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 5: Business Name and Username */}
            {currentStep === 5 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-medium mb-4">Let's get your account created, {formData.firstName}!</h1>
                  <p className="text-gray-500">Just a few more details to set up your profile.</p>
                </div>
                <form onSubmit={step5Form.handleSubmit(onSubmitStep5)} className="space-y-5">
                  {/* Business name input with real-time validation */}
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium">
                      What is the name of your business?
                    </Label>
                    <div className="relative">
                      <Input
                        {...step5Form.register("businessName", {
                          onChange: (e) => debouncedValidateBusinessName(e.target.value),
                        })}
                        placeholder="Your business name"
                        className={`border-[#e1e1e1] h-12 ${
                          validationErrors.businessName
                            ? "border-red-500"
                            : validationErrors.businessNameAvailable
                              ? "border-green-500"
                              : ""
                        }`}
                      />
                      {isValidatingBusinessName && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                      {validationErrors.businessNameAvailable && !isValidatingBusinessName && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">This name must be unique in our database</p>
                    {step5Form.formState.errors.businessName && (
                      <p className="text-red-500 text-sm mt-1">{step5Form.formState.errors.businessName.message}</p>
                    )}
                    {validationErrors.businessName ? (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.businessName}</p>
                    ) : validationErrors.businessNameAvailable ? (
                      <p className="text-green-500 text-sm mt-1">Business name is available!</p>
                    ) : null}
                  </div>

                  {/* Username input with real-time validation */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      What do you want your Hotplate username to be?
                    </Label>
                    <div className="relative">
                      <Input
                        {...step5Form.register("username", {
                          onChange: (e) => debouncedValidateUsername(e.target.value),
                        })}
                        placeholder="yourusername"
                        className={`border-[#e1e1e1] h-12 ${
                          validationErrors.username
                            ? "border-red-500"
                            : validationErrors.usernameAvailable
                              ? "border-green-500"
                              : ""
                        }`}
                      />
                      {isValidatingUsername && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                      {validationErrors.usernameAvailable && !isValidatingUsername && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Your storefront link will be www.{SITE_NAME}.com/{step5Form.watch("username") || "username"}
                    </p>
                    {step5Form.formState.errors.username && (
                      <p className="text-red-500 text-sm mt-1">{step5Form.formState.errors.username.message}</p>
                    )}
                    {validationErrors.username ? (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                    ) : validationErrors.usernameAvailable ? (
                      <p className="text-green-500 text-sm mt-1">Username is available!</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Controller
                        control={step5Form.control}
                        name="termsAgreed"
                        render={({ field }) => (
                          <Checkbox
                            id="terms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="text-[#ec711e] border-[#e1e1e1]"
                          />
                        )}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        By submitting this form you agree to Hotplate's{" "}
                        <a href="#" className="text-[#ec711e] underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-[#ec711e] underline">
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                    {step5Form.formState.errors.termsAgreed && (
                      <p className="text-red-500 text-sm mt-1">{step5Form.formState.errors.termsAgreed.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 h-12 rounded-full border-[#e1e1e1]"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !isStep5Valid}
                      className={`
                        flex-1 ${
                          isLoading || !isStep5Valid
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#ec711e] hover:bg-[#d86518]"
                        } text-white h-12 rounded-full flex items-center justify-center
                      `}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          Submit <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
        <div className="hidden md:block w-full md:w-1/2 p-4">
          <div className="relative h-[500px] w-full">
            <Image
              src="/signup-image.svg?height=800&width=800"
              alt="Delicious food illustration"
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
