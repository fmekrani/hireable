"use client";

import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ArrowRight, Sparkles, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import VaporizeTextCycle from "./vapour-text-effect";
import { ProfileDropdown } from "./profile-dropdown";

// Ethereal beam shader - creates flowing light beams
const BeamMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#ffffff") },
    uOpacity: { value: 0.15 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Create flowing beam effect
      float beam = sin(vUv.y * 3.14159) * 0.5 + 0.5;
      beam *= sin(vUv.x * 6.28318 + uTime * 0.5) * 0.3 + 0.7;
      
      // Add subtle pulse
      float pulse = sin(uTime * 0.3) * 0.1 + 0.9;
      
      // Edge fade
      float edgeFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
      edgeFade *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
      
      float alpha = beam * pulse * edgeFade * uOpacity;
      
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

function EtherealBeam({
  position,
  rotation,
  scale,
  color,
  speed = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0.12 },
    }),
    [color]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * speed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.0002 * speed;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[4, 8, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={BeamMaterial.vertexShader}
        fragmentShader={BeamMaterial.fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 100;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const positionAttribute = useMemo(() => {
    return new THREE.BufferAttribute(positions, 3);
  }, [positions]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={positionAttribute} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  const { viewport } = useThree();

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />

      {/* Main ethereal beams */}
      <EtherealBeam
        position={[-3, 0, -2]}
        rotation={[0, 0, 0.3]}
        scale={[1.5, 2, 1]}
        color="#ffffff"
        speed={0.8}
      />
      <EtherealBeam
        position={[3, 1, -3]}
        rotation={[0, 0, -0.2]}
        scale={[1.2, 2.5, 1]}
        color="#e0e0e0"
        speed={1.2}
      />
      <EtherealBeam
        position={[0, -1, -1]}
        rotation={[0, 0, 0.1]}
        scale={[2, 1.5, 1]}
        color="#f0f0f0"
        speed={1}
      />
      <EtherealBeam
        position={[-2, 2, -4]}
        rotation={[0, 0, -0.4]}
        scale={[1, 3, 1]}
        color="#d0d0d0"
        speed={0.6}
      />
      <EtherealBeam
        position={[4, -2, -2]}
        rotation={[0, 0, 0.5]}
        scale={[1.3, 2, 1]}
        color="#ffffff"
        speed={0.9}
      />

      {/* Floating particles */}
      <FloatingParticles />
    </>
  );
}

export function EtherealBeamsHero() {
  const [mounted, setMounted] = useState(false);
  const [showVaporizer, setShowVaporizer] = useState(false);
  const [hasShownVaporizer, setHasShownVaporizer] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    setMounted(true);
    
    // Check for auth results from OAuth callback
    const authParam = searchParams.get('auth');
    const errorParam = searchParams.get('message');
    
    if (authParam === 'success') {
      setShowSuccessModal(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (authParam === 'error') {
      setErrorMessage(errorParam || 'Authentication failed. Please try again.');
      setShowErrorModal(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    
    // Check if user has seen the vaporizer before
    const hasSeenVaporizer = sessionStorage.getItem("hireable_vaporizer_shown");
    
    if (!hasSeenVaporizer) {
      setShowVaporizer(true);
      setHasShownVaporizer(true);
      // Mark that we've shown it in this session
      sessionStorage.setItem("hireable_vaporizer_shown", "true");
      
      // After animation completes (2.5s vaporize + 1.5s fade), replace with static text
      const animationDuration = (2.5 + 1.5) * 1000; // ~4 seconds
      const hideTimer = setTimeout(() => {
        setShowVaporizer(false);
      }, animationDuration);
      
      return () => clearTimeout(hideTimer);
    }
  }, [searchParams]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Three.js Canvas Background */}
      {mounted && (
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 60 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-5 md:px-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              hireable.ai
            </span>
          </div>

          <ProfileDropdown />
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Vaporize Text Effect */}
            {showVaporizer ? (
              <div className="mb-12 h-40 flex items-center justify-center">
                <VaporizeTextCycle
                  texts={["hireable.ai"]}
                  font={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "80px",
                    fontWeight: 700,
                  }}
                  color="rgb(255, 255, 255)"
                  spread={5}
                  density={5}
                  animation={{
                    vaporizeDuration: 2.5,
                    fadeInDuration: 1.5,
                    waitDuration: 0,
                  }}
                  direction="left-to-right"
                  alignment="center"
                />
              </div>
            ) : (
              <div className="mb-12 h-40 flex items-center justify-center">
                <h2 className="text-6xl md:text-7xl font-bold text-white">hireable.ai</h2>
              </div>
            )}

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-sm">
                AI-powered job prep
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                Your AI job prep
              </span>
              <br />
              <span className="bg-gradient-to-b from-white/90 via-white/70 to-white/30 bg-clip-text text-transparent">
                copilot
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
              Paste a job link, upload your resume, get a skill gap map,
              timeline, and AI interviewer prep. Land your dream role faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/analysis"
                className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all hover:gap-3"
              >
                Start analysis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/interview"
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 text-white border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                AI interviewer
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-sm mx-4 text-center">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to hireable!</h2>
            <p className="text-white/70 mb-6">You've successfully signed in. Let's get started on your job prep journey.</p>
            <Link
              href="/analysis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Go to Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-sm mx-4 text-center">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-white/70 mb-6">{errorMessage}</p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default EtherealBeamsHero;
