"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Form validation schema
const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, {
    message: "Please enter a valid phone number (10-15 digits)",
  }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true)

    try {
  // API call to backend (uses NEXT_PUBLIC_API_URL)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:3000"
  const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong")
      }

      // Show success message
      toast.success("Signup successful! Welcome aboard.", {
        duration: 5000,
      })

      // Redirect or show success state
      // You can add redirection logic here
    } catch (error) {
      // Show error message
      toast.error(error instanceof Error ? error.message : "Failed to sign up. Please try again.", {
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-xl overflow-hidden bg-white shadow-lg">
      {/* Form Section */}
      <motion.div
        className="w-full md:w-1/2 p-8 md:p-12"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-[#000000] mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Hi chef!
          </motion.h1>
          <motion.h2
            className="text-2xl font-semibold text-[#000000] mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Let's get started.
          </motion.h2>
          <motion.p
            className="text-[#707070]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Tell us a bit about yourself.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[#707070]">
              First name <span className="text-[#ec711e]">*</span>
            </Label>
            <Input
              id="firstName"
              className={`border-[#e1e1e1] focus:border-[#ec711e] focus:ring-[#ec711e] ${errors.firstName ? "border-red-500" : ""}`}
              {...register("firstName")}
            />
            {errors.firstName && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.firstName.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[#707070]">
              Last name <span className="text-[#ec711e]">*</span>
            </Label>
            <Input
              id="lastName"
              className={`border-[#e1e1e1] focus:border-[#ec711e] focus:ring-[#ec711e] ${errors.lastName ? "border-red-500" : ""}`}
              {...register("lastName")}
            />
            {errors.lastName && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.lastName.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#707070]">
              Email <span className="text-[#ec711e]">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              className={`border-[#e1e1e1] focus:border-[#ec711e] focus:ring-[#ec711e] ${errors.email ? "border-red-500" : ""}`}
              {...register("email")}
            />
            {/* {errors.email && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.email.message}
              </motion.p>
            )} */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-[#707070]">
              Phone number <span className="text-[#ec711e]">*</span>
            </Label>
            <Input
              id="phoneNumber"
              className={`border-[#e1e1e1] focus:border-[#ec711e] focus:ring-[#ec711e] ${errors.phoneNumber ? "border-red-500" : ""}`}
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.phoneNumber.message}
              </motion.p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ec711e] hover:bg-[#d86418] text-white font-medium py-2 px-4 rounded-full transition-all duration-200"
            >
              {isSubmitting ? "Processing..." : "Continue"}
            </Button>
          </motion.div>
        </form>
      </motion.div>

      {/* Image Section */}
      <motion.div
        className="hidden md:block w-1/2 relative"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image src="/images/salad-bowl.jpg" alt="Fresh salad in a bowl" fill style={{ objectFit: "cover" }} priority />
      </motion.div>
    </div>
  )
}
