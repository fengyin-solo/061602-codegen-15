<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { GameState } from '@/types/game'
import { WEATHER_COLORS, COLONY_ESTABLISH_COST, MIN_COLONY_BIRDS, MAX_COLONY_BIRDS, COLONY_FOOD_PER_BIRD } from '@/utils/constants'

const props = defineProps<{
  state: GameState
  allAdults: boolean
  canCreateColony: boolean
  adultCount: number
}>()

const emit = defineEmits<{
  (e: 'release'): void
  (e: 'breed'): void
  (e: 'openColony'): void
  (e: 'closeColony'): void
  (e: 'toggleBirdSelection', id: string): void
  (e: 'createColony', foodAllocation: number): void
}>()

const lastLogCount = ref(0)
const showTip = ref(false)
const tipMessage = ref('')
const foodAllocation = ref(30)

const availableAdults = computed(() =>
  props.state.birds.filter(b => !b.isDead && b.stage === 'adult' && !b.colonyId)
)

const selectedCount = computed(() => props.state.selectedColonyBirdIds?.length ?? 0)

const minFoodAllocation = computed(() => selectedCount.value * COLONY_FOOD_PER_BIRD)

const canConfirmColony = computed(() =>
  selectedCount.value >= MIN_COLONY_BIRDS &&
  selectedCount.value <= MAX_COLONY_BIRDS &&
  foodAllocation.value >= minFoodAllocation.value &&
  props.state.foodStock >= COLONY_ESTABLISH_COST + foodAllocation.value
)

watch(
  () => props.state.eventLog.length,
  (newLen) => {
    if (newLen > lastLogCount.value && props.state.eventLog[0]) {
      const last = props.state.eventLog[0]
      if (last.type === 'warning' || last.type === 'danger' || last.type === 'success') {
        tipMessage.value = last.message
        showTip.value = true
        setTimeout(() => { showTip.value = false }, 2500)
      }
    }
    lastLogCount.value = newLen
  },
  { immediate: true }
)

watch(
  () => selectedCount.value,
  () => {
    const minFood = selectedCount.value * COLONY_FOOD_PER_BIRD
    if (foodAllocation.value < minFood) {
      foodAllocation.value = minFood
    }
  }
)

const handleCreateColony = () => {
  if (canConfirmColony.value) {
    emit('createColony', foodAllocation.value)
  }
}
</script>

<template>
  <div class="relative w-full h-full flex flex-col gap-3 p-4">
    <div
      v-if="showTip"
      class="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-pop-in"
    >
      <div
        :class="[
          'px-5 py-2.5 rounded-2xl font-medium text-white shadow-2xl',
          state.eventLog[0]?.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
          state.eventLog[0]?.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
          state.eventLog[0]?.type === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
          'bg-gradient-to-r from-blue-500 to-indigo-500',
        ]"
      >
        {{ tipMessage }}
      </div>
    </div>

    <div v-if="canCreateColony && !allAdults" class="animate-pop-in">
      <div class="glass rounded-2xl p-4 card-shadow border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
        <div class="text-center mb-3">
          <div class="text-2xl mb-1">🏡</div>
          <div class="font-display text-lg text-emerald-300">成鸟数量较多</div>
          <div class="text-xs text-white/60 mt-1">可以建立分巢，分散资源压力~</div>
        </div>
        <button
          class="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold
                 btn-3d hover:from-emerald-400 hover:to-teal-500 flex items-center justify-center gap-2"
          @click="emit('openColony')"
        >
          <span>🌿</span>
          建立分巢
        </button>
      </div>
    </div>

    <div v-if="allAdults" class="animate-pop-in">
      <div class="glass rounded-2xl p-5 card-shadow border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
        <div class="text-center mb-4">
          <div class="text-3xl mb-2">🎉</div>
          <div class="font-display text-2xl text-yellow-300 text-stroke">全部长成成鸟啦！</div>
          <div class="text-sm text-white/70 mt-1">请选择它们的未来...</div>
        </div>
        <div class="flex gap-3 justify-center flex-wrap">
          <button
            class="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-bold
                   btn-3d hover:from-sky-400 hover:to-blue-500 flex items-center gap-2"
            @click="emit('release')"
          >
            <span class="text-xl">🕊️</span>
            放飞自由
          </button>
          <button
            v-if="state.breedingCount < state.maxBreedingRounds"
            class="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold
                   btn-3d hover:from-pink-400 hover:to-rose-500 flex items-center gap-2"
            @click="emit('breed')"
          >
            <span class="text-xl">💝</span>
            留下配对 ({{ state.breedingCount }}/{{ state.maxBreedingRounds }})
          </button>
          <button
            v-if="canCreateColony"
            class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold
                   btn-3d hover:from-emerald-400 hover:to-teal-500 flex items-center gap-2"
            @click="emit('openColony')"
          >
            <span class="text-xl">🏡</span>
            迁居分巢
          </button>
          <button
            v-else
            class="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-2xl font-bold
                   btn-3d hover:from-amber-400 hover:to-yellow-500 flex items-center gap-2"
            @click="emit('release')"
          >
            <span class="text-xl">🏡</span>
            留下陪伴（结束）
          </button>
        </div>
      </div>
    </div>

    <div v-if="state.colonies.length > 0" class="space-y-2">
      <div class="text-sm text-amber-300 flex items-center gap-1.5 px-1">
        <span>🏡</span> 分巢状态
      </div>
      <div
        v-for="colony in state.colonies"
        :key="colony.id"
        class="glass rounded-xl p-3 border border-emerald-400/20 bg-emerald-500/5"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-emerald-300">{{ colony.name }}</span>
          <span class="text-xs text-white/50">第{{ colony.daysSinceEstablished }}天</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs text-white/70">
          <div class="text-center">
            <div class="text-lg">🐦</div>
            <div>{{ colony.birdIds.length }}只</div>
          </div>
          <div class="text-center">
            <div class="text-lg">🍒</div>
            <div>{{ colony.foodAllocation }}</div>
          </div>
          <div class="text-center">
            <div class="text-lg">📦</div>
            <div>+{{ colony.totalProduced }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 space-y-2 overflow-y-auto scrollbar-hide pr-1">
      <div v-for="log in state.eventLog.slice(0, 15)" :key="log.id" class="text-xs">
        <div
          :class="[
            'px-3 py-2 rounded-xl flex items-start gap-2',
            log.type === 'success' ? 'bg-green-500/15 text-green-200' :
            log.type === 'warning' ? 'bg-amber-500/15 text-amber-200' :
            log.type === 'danger' ? 'bg-red-500/15 text-red-200' :
            'bg-white/10 text-white/80',
          ]"
        >
          <span class="opacity-60 shrink-0 text-[10px] mt-0.5">
            {{ new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
          </span>
          <span>{{ log.message }}</span>
        </div>
      </div>
      <div v-if="state.eventLog.length === 0" class="text-center text-white/40 text-sm py-8">
        游戏日志将在这里显示~
      </div>
    </div>

    <div
      v-if="state.showColonyModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="emit('closeColony')"
    >
      <div class="w-full max-w-md glass rounded-3xl p-6 card-shadow border border-emerald-400/30 animate-pop-in max-h-[80vh] overflow-y-auto">
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">🏡</div>
          <h2 class="font-display text-2xl text-emerald-300">建立分巢</h2>
          <p class="text-sm text-white/60 mt-1">选择迁居的成鸟，分配初始食物</p>
        </div>

        <div class="mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-400/20">
          <div class="text-sm text-amber-300 flex items-center gap-2">
            <span>💡</span>
            <span>建立费用：{{ COLONY_ESTABLISH_COST }} 食物</span>
          </div>
          <div class="text-xs text-white/50 mt-1">
            每只鸟至少需要 {{ COLONY_FOOD_PER_BIRD }} 食物/天
          </div>
        </div>

        <div class="mb-4">
          <div class="text-sm text-white/80 mb-2 flex justify-between">
            <span>选择成鸟 ({{ selectedCount }}/{{ MAX_COLONY_BIRDS }})</span>
            <span class="text-xs text-white/50">至少 {{ MIN_COLONY_BIRDS }} 只</span>
          </div>
          <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
            <div
              v-for="bird in availableAdults"
              :key="bird.id"
              class="p-3 rounded-xl cursor-pointer transition-all border"
              :class="[
                state.selectedColonyBirdIds?.includes(bird.id)
                  ? 'bg-emerald-500/30 border-emerald-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              ]"
              @click="emit('toggleBirdSelection', bird.id)"
            >
              <div class="text-sm font-medium text-white">{{ bird.name }}</div>
              <div class="text-xs text-white/50 mt-0.5">❤️ {{ Math.round(bird.health) }} 🍒 {{ Math.round(bird.hunger) }}</div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <div class="text-sm text-white/80 mb-2 flex justify-between">
            <span>分配初始食物</span>
            <span class="text-emerald-300 font-bold">{{ foodAllocation }}</span>
          </div>
          <input
            type="range"
            v-model.number="foodAllocation"
            :min="minFoodAllocation"
            :max="Math.min(100, state.foodStock - COLONY_ESTABLISH_COST)"
            step="5"
            class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div class="flex justify-between text-xs text-white/40 mt-1">
            <span>最少 {{ minFoodAllocation }}</span>
            <span>剩余 {{ state.foodStock - COLONY_ESTABLISH_COST - foodAllocation }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-3 bg-white/10 text-white/80 rounded-xl font-medium hover:bg-white/20 transition-all"
            @click="emit('closeColony')"
          >
            取消
          </button>
          <button
            class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold
                   btn-3d hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canConfirmColony"
            @click="handleCreateColony"
          >
            确认建立
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
