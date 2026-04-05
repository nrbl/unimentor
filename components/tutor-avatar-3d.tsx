"use client"

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useAnimations, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

const GLB_URL = "/avatar2.glb"

export type TutorAvatarSize = "sm" | "md" | "lg" | "xl"

/** Портрет «как на фото 3×4»: выше, акцент на лицо */
const canvasSize: Record<TutorAvatarSize, { w: number; h: number }> = {
  sm: { w: 40, h: 53 },
  md: { w: 72, h: 96 },
  lg: { w: 200, h: 267 },
  /** Боковая панель чата: крупный портрет */
  xl: { w: 260, h: 347 },
}

type MorphMesh = THREE.Mesh & {
  morphTargetDictionary: Record<string, number>
  morphTargetInfluences: number[]
}

function setMorph(mesh: MorphMesh, name: string, value: number) {
  const d = mesh.morphTargetDictionary
  const inf = mesh.morphTargetInfluences
  if (!d || !inf || d[name] === undefined) return
  inf[d[name]] = value
}

/** Камера только на голову: бокс по мешу головы + лёгкий ракурс ¾ */
function HeadPortraitCamera({ root }: { root: THREE.Object3D }) {
  const { camera, size } = useThree()

  useLayoutEffect(() => {
    const head =
      root.getObjectByName("Streamoji_Head") ??
      root.getObjectByName("Head") ??
      null
    if (!head) return

    head.updateWorldMatrix(true, true)

    const box = new THREE.Box3().setFromObject(head)
    if (box.isEmpty()) return

    const center = new THREE.Vector3()
    const dim = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(dim)

    const persp = camera as THREE.PerspectiveCamera
    const vFov = THREE.MathUtils.degToRad(persp.fov)
    const margin = 1.12
    const dist = (dim.y * margin) / (2 * Math.tan(vFov / 2))

    // Как на документном фото 3×4: лицо почти анфас, чуть сбоку для объёма
    const dir = new THREE.Vector3(0.18, 0.05, 1).normalize()
    const pos = center.clone().addScaledVector(dir, dist)

    persp.position.copy(pos)
    persp.up.set(0, 1, 0)
    persp.lookAt(center)
    persp.near = Math.max(0.01, dist * 0.04)
    persp.far = dist * 80
    persp.updateProjectionMatrix()
  }, [root, camera, size.width, size.height])

  return null
}

function AvatarRig({ speaking }: { speaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(GLB_URL)
  const clone = useMemo(() => cloneSkinned(scene), [scene])
  const { actions, mixer } = useAnimations(animations, groupRef)

  const morphMeshes = useRef<MorphMesh[]>([])
  const jawSmooth = useRef(0)
  const funnelSmooth = useRef(0)
  const smileSmooth = useRef(0)

  useLayoutEffect(() => {
    const meshes: MorphMesh[] = []
    clone.traverse((obj) => {
      const m = obj as MorphMesh
      if (
        m.isMesh &&
        m.morphTargetDictionary &&
        m.morphTargetDictionary.jawOpen !== undefined
      ) {
        meshes.push(m)
      }
    })
    morphMeshes.current = meshes
  }, [clone])

  useEffect(() => {
    const idle = actions.idle_eyes ?? actions.idle_eyes_2
    if (!idle) return
    idle.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.45).play()
    return () => {
      idle.fadeOut(0.25)
    }
  }, [actions])

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta)

    const meshes = morphMeshes.current
    if (!meshes.length) return

    const t = state.clock.elapsedTime
    let jawTarget = 0
    let funnelTarget = 0
    let smileTarget = 0
    let closeTarget = 0

    if (speaking) {
      const a = 0.5 + 0.5 * Math.sin(t * 10.2)
      const b = 0.5 + 0.5 * Math.sin(t * 7.1 + 0.8)
      const c = 0.5 + 0.5 * Math.sin(t * 15.4 + 2.1)
      const d = 0.5 + 0.5 * Math.sin(t * 4.2)
      const blend = 0.32 * a + 0.28 * b + 0.22 * c + 0.18 * d
      jawTarget = 0.18 + 0.62 * blend
      jawTarget = THREE.MathUtils.clamp(jawTarget, 0.14, 0.92)
      funnelTarget = 0.1 + 0.28 * jawTarget
      smileTarget = 0.08 + 0.12 * Math.sin(t * 6)
      closeTarget = Math.max(0, 0.22 * (1 - jawTarget))
    }

    const k = 1 - Math.exp(-delta * 14)
    jawSmooth.current += (jawTarget - jawSmooth.current) * k
    funnelSmooth.current += (funnelTarget - funnelSmooth.current) * k
    smileSmooth.current += (smileTarget - smileSmooth.current) * k

    const jaw = jawSmooth.current
    const funnel = funnelSmooth.current
    const smile = smileSmooth.current

    for (const mesh of meshes) {
      setMorph(mesh, "jawOpen", jaw)
      setMorph(mesh, "mouthFunnel", speaking ? funnel : funnel * 0.2)
      setMorph(mesh, "jawForward", speaking ? 0.05 + 0.12 * jaw : 0)
      setMorph(mesh, "mouthSmileLeft", speaking ? smile : 0)
      setMorph(mesh, "mouthSmileRight", speaking ? smile : 0)
      setMorph(mesh, "mouthClose", speaking ? closeTarget : 0)
    }
  })

  return (
    <>
      <group ref={groupRef}>
        <primitive object={clone} />
      </group>
      {/* После привязки primitive к сцене считаем бокс головы */}
      <HeadPortraitCamera root={clone} />
    </>
  )
}

function AvatarCanvas({ speaking, size }: { speaking: boolean; size: TutorAvatarSize }) {
  const { w, h } = canvasSize[size]
  return (
    <Canvas
      className="touch-none"
      style={{ width: w, height: h }}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 1.6, 1.5], fov: 32, near: 0.05, far: 120 }}
    >
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 8, 5]} intensity={1.05} />
      <directionalLight position={[-5, 3, -3]} intensity={0.38} />
      <Suspense fallback={null}>
        <AvatarRig speaking={speaking} />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(GLB_URL)

export function TutorAvatar3D({
  speaking,
  size,
  className,
  failed,
}: {
  speaking: boolean
  size: TutorAvatarSize
  className?: string
  /** When asset load failed — show icon */
  failed?: boolean
}) {
  const { w, h } = canvasSize[size]
  const rounded = size === "sm" ? "rounded-full" : "rounded-2xl"
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    try {
      const c = document.createElement("canvas")
      const gl = c.getContext("webgl2") || c.getContext("webgl")
      setWebglOk(!!gl)
    } catch {
      setWebglOk(false)
    }
  }, [])

  if (failed || !webglOk) {
    const large = size === "lg" || size === "xl"
    const fb = large ? 56 : canvasSize[size].w
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary/10",
          rounded,
          className
        )}
        style={{ width: fb, height: fb }}
        role="img"
        aria-label="Тьютор"
      >
        <User className={cn("text-primary", large ? "h-8 w-8" : "h-4 w-4")} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-gradient-to-b from-muted/40 to-muted/10",
        rounded,
        className
      )}
      style={{ width: w, height: h }}
      role="img"
      aria-label={speaking ? "Тьютор говорит" : "Тьютор"}
    >
      <AvatarCanvas speaking={speaking} size={size} />
    </div>
  )
}
