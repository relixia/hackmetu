"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";

/** DiveAnimation Component
 *  Animates the camera from its current position to a target position,
 *  simulating a dive into the building.
 */
function DiveAnimation({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree();
  const initialPosition = useRef(camera.position.clone());
  // Set your desired target position for the dive here.
  const targetPosition = new THREE.Vector3(0, 0, 5);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    // A 2-second dive animation; adjust the duration by changing the divisor.
    const t = Math.min(time.current / 2, 1);
    camera.position.lerpVectors(initialPosition.current, targetPosition, t);
    if (t === 1) {
      onComplete();
    }
  });

  return null;
}

/** AnimatedText Component */
function AnimatedText({
  phase,
  onDisintegrateComplete,
}: {
  phase: string;
  onDisintegrateComplete: () => void;
}) {
  const textRef = useRef<any>();

  useFrame((state, delta) => {
    if (!textRef.current) return;
    if (phase === "intro") {
      textRef.current.position.z = THREE.MathUtils.lerp(
        textRef.current.position.z,
        0,
        delta
      );
    } else if (phase === "disintegrate") {
      textRef.current.material.opacity = THREE.MathUtils.lerp(
        textRef.current.material.opacity,
        0,
        delta * 2
      );
      textRef.current.scale.x = THREE.MathUtils.lerp(
        textRef.current.scale.x,
        1.2,
        delta
      );
      textRef.current.scale.y = THREE.MathUtils.lerp(
        textRef.current.scale.y,
        1.2,
        delta
      );
      if (textRef.current.material.opacity < 0.05) {
        onDisintegrateComplete();
      }
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 0, 30]}
      fontSize={2}
      color="white"
      anchorX="center"
      anchorY="middle"
      material-opacity={1}
      material-transparent={true}
      maxWidth={25}
      textAlign="center"
    >
      Do you want to revolutionize your call center architecture?
    </Text>
  );
}

/** ParticleExplosion Component */
function ParticleExplosion({ onComplete }: { onComplete: () => void }) {
  const pointsRef = useRef<any>();
  const count = 1500;
  const positions = useRef(new Float32Array(count * 3));
  const velocities = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3 + 0] = 0;
      positions.current[i * 3 + 1] = 0;
      positions.current[i * 3 + 2] = 0;

      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * Math.PI;
      const speed = Math.random() * 5 + 3;
      velocities.current[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities.current[i * 3 + 1] = Math.cos(phi) * speed;
      velocities.current[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
  }, []);

  useFrame((state, delta) => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3 + 0] += velocities.current[i * 3 + 0] * delta;
      positions.current[i * 3 + 1] += velocities.current[i * 3 + 1] * delta;
      positions.current[i * 3 + 2] += velocities.current[i * 3 + 2] * delta;
    }
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.15} transparent opacity={0.8} />
    </points>
  );
}

/** RotatingBuilding Component */
function RotatingBuilding() {
  const groupRef = useRef<any>();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 1.5;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime / 5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Building Base */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[12, 1, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Floors */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, i * 1.5, 0]}>
          <boxGeometry args={[10, 1.2, 10]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#555" : "#777"}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 8 * 1.5 + 0.6, 0]}>
        <boxGeometry args={[10, 0.8, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

/** FloatingParticles Component */
function FloatingParticles() {
  const pointsRef = useRef<any>();
  const count = 500;
  const positions = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3 + 0] = (Math.random() - 0.5) * 50;
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
  }, []);

  useFrame((state, delta) => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3 + 1] += delta * 0.1;
      if (positions.current[i * 3 + 1] > 25) {
        positions.current[i * 3 + 1] = -25;
      }
    }
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#888" size={0.2} transparent opacity={0.6} />
    </points>
  );
}

/** CTAButton Component */
function CTAButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "12px 24px",
        fontSize: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "#00e6ff",
        border: "2px solid #00e6ff",
        borderRadius: "5px",
        cursor: "pointer",
        textTransform: "uppercase",
        letterSpacing: "2px",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: hover
          ? "0 0 25px rgba(0,230,255,0.8)"
          : "0 0 15px rgba(0,230,255,0.5)",
        transform: hover ? "scale(1.05)" : "scale(1)",
      }}
    >
      Engage the Revolution
    </button>
  );
}

/** PortalTransition Component */
function PortalTransition({ onComplete }: { onComplete: () => void }) {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 2000; // 2 seconds animation
    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setScale(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "200vw",
        height: "200vw",
        background: "radial-gradient(circle, #555, #000)",
        borderRadius: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: 30,
        pointerEvents: "none",
        boxShadow: "0 0 50px rgba(255,255,255,0.5)",
      }}
    />
  );
}

/** LandingPage Component */
export default function LandingPage() {
  const [phase, setPhase] = useState("intro");
  const [showExplosion, setShowExplosion] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [diving, setDiving] = useState(false);
  const [portalActive, setPortalActive] = useState(false);
  const router = useRouter();

  // Transition from "intro" to "disintegrate" after 3 seconds.
  useEffect(() => {
    if (phase === "intro") {
      const timeout = setTimeout(() => {
        setPhase("disintegrate");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  const handleDisintegrationComplete = () => {
    setShowExplosion(true);
  };

  const handleExplosionComplete = () => {
    setPhase("building");
    // Show the CTA button a few seconds after the building is visible.
    setTimeout(() => {
      setShowCTA(true);
    }, 3000);
  };

  // Update the CTA click handler to trigger the dive animation.
  const handleEnter = () => {
    setDiving(true);
  };

  return (
    <div
      className="w-screen h-screen relative"
      style={{ background: "linear-gradient(180deg, #000000, #1a1a1a)" }}
    >
      {showCTA && !portalActive && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <CTAButton onClick={handleEnter} />
        </div>
      )}
      {portalActive && (
        <PortalTransition onComplete={() => router.push("/pages/login")} />
      )}
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        style={{ filter: "contrast(1.2) brightness(1.1)" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Environment preset="sunset" />
        {(phase === "intro" || phase === "disintegrate") && (
          <AnimatedText
            phase={phase}
            onDisintegrateComplete={handleDisintegrationComplete}
          />
        )}
        {showExplosion && (
          <ParticleExplosion onComplete={handleExplosionComplete} />
        )}
        {phase === "building" && <RotatingBuilding />}
        <FloatingParticles />
        {/* When diving is active, animate the camera dive */}
        {diving && (
          <DiveAnimation onComplete={() => setPortalActive(true)} />
        )}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}