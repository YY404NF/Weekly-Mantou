<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FullscreenMantouPreview from '@/components/FullscreenMantouPreview.vue'
import PoolMantouCard from '@/components/PoolMantouCard.vue'
import type { MantouItem } from '@/types/mantou'

const props = defineProps<{
  items: MantouItem[]
}>()

const emit = defineEmits<{
  close: []
}>()

const entered = ref(false)
const activePreviewItem = ref<MantouItem | null>(null)
const sortedItems = computed(() => {
  const fixedItems = props.items.filter((item) => item.fixed)
  const normalItems = props.items.filter((item) => !item.fixed)
  return [...fixedItems, ...normalItems]
})

onMounted(() => {
  requestAnimationFrame(() => {
    entered.value = true
  })
})

function closeOverlay(): void {
  entered.value = false
  window.setTimeout(() => emit('close'), 240)
}

function openPreview(item: MantouItem): void {
  activePreviewItem.value = item
}

function closePreview(): void {
  activePreviewItem.value = null
}
</script>

<template>
  <div class="pool-overlay" :class="{ 'is-visible': entered }">
    <section class="pool-panel" :class="{ 'is-visible': entered }">
      <div class="pool-panel-head">
        <h2>奖池内容</h2>
      </div>

      <div class="pool-grid-scroll">
        <div class="pool-grid">
        <PoolMantouCard
          v-for="(item, index) in sortedItems"
          :key="item.id"
          :item="item"
          :index="index"
          @preview="openPreview"
        />
        </div>
      </div>
    </section>

    <button class="pool-close-btn" :class="{ 'is-visible': entered }" @click="closeOverlay">关闭奖池</button>
  </div>

  <FullscreenMantouPreview
    v-if="activePreviewItem"
    :item="activePreviewItem"
    @close="closePreview"
  />
</template>
