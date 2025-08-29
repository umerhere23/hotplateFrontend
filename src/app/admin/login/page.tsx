"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/config";
import Link from "next/link";
// import FoodLoader from "../../../components/food-loader"; // Assuming you have a loader component

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard"); // Redirect to admin dashboard on successful login
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-gray-100 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {/* {isLoading ? <FoodLoader /> : "Sign In"} */}
              {isLoading ? "Signing in..." : "Sign In"}

            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm">
              Forgot your password?{" "}
              <Link href="#" className="underline">
                Reset it here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/diverse-food-spread.png')" }}>
        {/* You can add content over the image if you want, e.g. a welcome message */}
      </div>
    </div>
  );
}
