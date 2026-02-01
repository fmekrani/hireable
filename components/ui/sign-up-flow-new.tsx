"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { CanvasRevealEffect, MiniNavbar } from "./sign-in-flow-new";

interface SignUpPageProps {
  className?: string;
}

export const SignUpPage = ({ className }: SignUpPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState<"credentials" | "success">("credentials");
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithOAuth, session } = useAuth();
  const router = useRouter();

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !fullName) return;

    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Call Supabase sign up
      await signUp(email, password, fullName);

      // Show success animation
      setReverseCanvasVisible(true);
      setTimeout(() => {
        setInitialCanvasVisible(false);
      }, 20);
      setTimeout(() => {
        setStep("success");
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || "Sign up failed. Please try again.";
      setError(errorMessage);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Show success animation
      setReverseCanvasVisible(true);
      setTimeout(() => {
        setInitialCanvasVisible(false);
      }, 20);
      setTimeout(() => {
        setStep("success");
      }, 1200);
      
      // Start the OAuth flow immediately (redirect to Google)
      await signInWithOAuth("google");
      // Redirect will happen automatically via callback
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || "Google sign up failed. Please try again.";
      setError(errorMessage);
    }
  };

  // Redirect to analysis page after successful sign up
  useEffect(() => {
    if (step === "success" && session) {
      setTimeout(() => {
        router.push("/analysis");
      }, 1000);
    }
  }, [step, session, router]);

  return (
    <div className={cn("flex w-[100%] flex-col min-h-screen bg-black relative", className)}>
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect animationSpeed={3} containerClassName="bg-black" colors={[[255, 255, 255]]} dotSize={6} reverse={false} />
          </div>
        )}

        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect animationSpeed={4} containerClassName="bg-black" colors={[[255, 255, 255]]} dotSize={6} reverse={true} />
          </div>
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <MiniNavbar />

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full mt-[100px] max-w-sm px-6">
              <AnimatePresence mode="wait">
                {step === "credentials" ? (
                  <motion.div
                    key="credentials-step"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Create Account</h1>
                      <p className="text-[1.2rem] text-white/70 font-light">Join hireable today</p>
                    </div>

                    <div className="space-y-4">
                      <button 
                        onClick={handleGoogleSignUp}
                        disabled={isLoading}
                        className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/10 rounded-full py-3 px-4 transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Signing up...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg">G</span>
                            <span>Sign up with Google</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-white/40 text-sm">or</span>
                        <div className="h-px bg-white/10 flex-1" />
                      </div>

                      <form onSubmit={handleSignUpSubmit} className="space-y-4">
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30"
                          >
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                          </motion.div>
                        )}

                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={isLoading}
                            className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-white/5 placeholder:text-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-white/5 placeholder:text-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-white/5 placeholder:text-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="password"
                            placeholder="confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 text-center bg-white/5 placeholder:text-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                          />
                        </div>

                        <motion.button
                          type="submit"
                          disabled={!email || !password || !confirmPassword || !fullName || isLoading}
                          whileHover={!isLoading ? { scale: 1.05 } : {}}
                          whileTap={!isLoading ? { scale: 0.95 } : {}}
                          className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </motion.button>
                      </form>

                      <div className="pt-4">
                        <p className="text-white/60 text-sm">
                          Already have an account?{" "}
                          <Link href="/sign-in" className="text-white hover:underline font-semibold">
                            Sign in
                          </Link>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-white/40 pt-10">
                      By creating an account, you agree to our{" "}
                      <Link href="#" className="underline text-white/60 hover:text-white/80">
                        Terms
                      </Link>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Welcome!</h1>
                      <p className="text-[1.25rem] text-white/50 font-light">Account created successfully</p>
                    </div>

                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="py-10"
                    >
                      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      onClick={() => {
                        window.location.href = "/analysis";
                      }}
                      className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors"
                    >
                      Go to Dashboard
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
