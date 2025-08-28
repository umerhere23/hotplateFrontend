"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/firebase/config"

export function useAuthRedirect(redirectTo = "/dashboard") {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to the specified route
        router.replace(redirectTo)
      }
    })

    // Clean up subscription on unmount
    return () => unsubscribe()
  }, [router, redirectTo])
}
