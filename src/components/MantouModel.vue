<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { Box3, Group, Vector3 } from 'three'
import type { Object3D } from 'three'
import { useGLTF } from '@tresjs/cientos'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getFallbackModelUrl, resolveModelUrl } from '@/utils/modelUrl'

const props = defineProps<{
  modelUrl: string
  scale?: number
}>()

const emit = defineEmits<{
  loaded: []
}>()

const fallbackModelUrl = getFallbackModelUrl()
const modelObject = shallowRef<Group | null>(null)
const loadedOnce = shallowRef(false)
const { execute } = useGLTF(fallbackModelUrl)
let loadToken = 0

function createNormalizedModel(scene: Object3D): Group {
  scene.updateMatrixWorld(true)

  const bounds = new Box3().setFromObject(scene)
  const size = new Vector3()
  const center = new Vector3()

  bounds.getSize(size)
  bounds.getCenter(center)

  scene.position.x -= center.x
  scene.position.y -= bounds.min.y
  scene.position.z -= center.z

  const root = new Group()
  root.add(scene)

  const maxDimension = Math.max(size.x, size.y, size.z, 0.0001)
  const normalizeScale = 1 / maxDimension
  root.scale.setScalar(normalizeScale)

  return root
}

async function loadModel(url: string): Promise<void> {
  const currentToken = ++loadToken
  loadedOnce.value = false
  modelObject.value = null

  const nextUrl = await resolveModelUrl(url || fallbackModelUrl)
  if (currentToken !== loadToken) return

  try {
    const gltf = await execute(0, nextUrl)
    if (currentToken !== loadToken) return

    modelObject.value = createNormalizedModel(clone(gltf.scene))
  } catch {
    if (nextUrl === fallbackModelUrl || currentToken !== loadToken) return

    const gltf = await execute(0, fallbackModelUrl)
    if (currentToken !== loadToken) return

    modelObject.value = createNormalizedModel(clone(gltf.scene))
  }

  if (currentToken === loadToken && modelObject.value && !loadedOnce.value) {
    loadedOnce.value = true
    emit('loaded')
  }
}

watch(
  () => props.modelUrl,
  (url) => {
    void loadModel(url)
  },
  { immediate: true },
)
</script>

<template>
  <primitive
    v-if="modelObject"
    :object="modelObject"
    :scale="props.scale ?? 0.8"
  />
</template>
