<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameState } from '@/composables/useGameState'

const router = useRouter()
const { state, restartGame, returnToStart } = useGameState()

onMounted(() => {
  if (state.phase !== 'ended' && !state.score) {
    router.push('/')
  }
})

const score = computed(() => state.score)

const starArray = computed(() => {
  const s = score.value?.stars ?? 1
  return Array.from({ length: 5 }, (_, i) => i < s)
})

const handleRestart = () => {
  restartGame()
  router.push('/game')
}

const handleHome = () => {
  returnToStart()
  router.push('/')
}
</script>

<template>
  <div class="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 flex items-center justify-center p-6 overflow-auto">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 left-[10%] text-5xl opacity-20 animate-float">✨</div>
      <div class="absolute top-1/4 right-[15%] text-4xl opacity-20 animate-float" style="animation-delay: 0.5s">🌟</div>
      <div class="absolute bottom-1/4 left-[20%] text-5xl opacity-20 animate-float" style="animation-delay: 1s">🐦</div>
      <div class="absolute bottom-20 right-[10%] text-4xl opacity-20 animate-float" style="animation-delay: 1.5s">🌿</div>
    </div>

    <div v-if="score" class="relative z-10 max-w-2xl w-full">
      <div class="text-center mb-6 animate-pop-in">
        <div class="text-7xl mb-4">{{ score.stars >= 4 ? '🏆' : score.stars >= 3 ? '🎉' : '🌱' }}</div>
        <h1 class="font-display text-5xl text-white mb-2 text-stroke">游戏结束</h1>
        <div class="font-display text-3xl text-amber-300 mb-6">{{ score.rank }}</div>
      </div>

      <div class="flex justify-center gap-2 mb-8 animate-pop-in" style="animation-delay: 0.1s">
        <div
          v-for="(filled, idx) in starArray"
          :key="idx"
          class="text-5xl transition-all"
          :class="filled ? 'animate-bounce-slow' : 'opacity-20 grayscale'"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          {{ filled ? '⭐' : '☆' }}
        </div>
      </div>

      <div class="glass rounded-3xl p-8 card-shadow animate-pop-in" style="animation-delay: 0.2s">
        <div class="text-center mb-8">
          <div class="text-white/60 text-sm mb-2">综合得分</div>
          <div class="font-display text-7xl text-yellow-300 text-stroke mb-1">
            {{ score.totalScore }}
            <span class="text-3xl text-white/60">/100</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
            <div class="text-3xl mb-2">💚</div>
            <div class="text-white/60 text-xs mb-1">成活率</div>
            <div class="font-bold text-2xl text-green-400">{{ score.survivalRate }}%</div>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
            <div class="text-3xl mb-2">❤️</div>
            <div class="text-white/60 text-xs mb-1">平均健康</div>
            <div class="font-bold text-2xl text-red-400">{{ score.avgHealth }}</div>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
            <div class="text-3xl mb-2">💝</div>
            <div class="text-white/60 text-xs mb-1">繁殖加成</div>
            <div class="font-bold text-2xl text-pink-400">+{{ score.breedingBonus }}</div>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
            <div class="text-3xl mb-2">🌟</div>
            <div class="text-white/60 text-xs mb-1">照料加成</div>
            <div class="font-bold text-2xl text-amber-400">+{{ score.personalityBonus }}</div>
          </div>

          <div v-if="score.colonyBonus > 0" class="bg-white/5 rounded-2xl p-4 text-center border border-emerald-400/20 col-span-2">
            <div class="text-3xl mb-2">🏡</div>
            <div class="text-white/60 text-xs mb-1">分巢加成 ({{ score.totalColonies }}个分巢)</div>
            <div class="font-bold text-2xl text-emerald-400">+{{ score.colonyBonus }}</div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-2xl p-5 mb-6 border border-amber-400/20">
          <div class="text-center">
            <div class="text-white/80 mb-3 flex items-center justify-center gap-2">
              <span>📊</span>
              <span class="font-medium">本次总结</span>
            </div>
            <div class="text-white/60 text-sm flex flex-wrap justify-center gap-x-6 gap-y-1">
              <span>📅 第 {{ state.day }} 天</span>
              <span>🥚 孵化 {{ state.totalHatched }} 只</span>
              <span>💔 离世 {{ state.totalDied }} 只</span>
              <span>💝 繁殖 {{ state.breedingCount }} 窝</span>
              <span>🐦 存活 {{ state.birds.filter(b => !b.isDead).length }} 只</span>
              <span v-if="state.colonies.length > 0">🏡 分巢 {{ state.colonies.length }} 个</span>
              <span v-if="state.colonies.length > 0">
                📦 分巢产出 {{ state.colonies.reduce((s, c) => s + c.totalProduced, 0) }} 食物
              </span>
            </div>
          </div>
        </div>

        <div v-if="state.birds.filter(b => !b.isDead).length > 0" class="mb-6">
          <div v-if="state.birds.filter(b => !b.isDead && !b.colonyId).length > 0" class="mb-4">
            <div class="text-white/60 text-sm text-center mb-3">🏠 主巢的鸟儿们</div>
            <div class="flex flex-wrap justify-center gap-2">
              <div
                v-for="bird in state.birds.filter(b => !b.isDead && !b.colonyId)"
                :key="bird.id"
                class="bg-white/10 px-3 py-1.5 rounded-xl text-sm text-white/90 flex items-center gap-1.5"
              >
                <span>🐦</span>
                <span class="font-medium">{{ bird.name }}</span>
              </div>
            </div>
          </div>

          <div v-for="colony in state.colonies" :key="colony.id" class="mb-4">
            <div class="text-emerald-400/80 text-sm text-center mb-3">🏡 {{ colony.name }} 的鸟儿们</div>
            <div class="flex flex-wrap justify-center gap-2">
              <div
                v-for="birdId in colony.birdIds"
                :key="birdId"
                class="bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-sm text-white/90 flex items-center gap-1.5"
              >
                <span>🐦</span>
                <span class="font-medium">{{ state.birds.find(b => b.id === birdId)?.name }}</span>
              </div>
            </div>
            <div class="text-center text-xs text-white/40 mt-2">
              建立 {{ colony.daysSinceEstablished }} 天 · 累计产出 {{ colony.totalProduced }} 食物
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl
                   font-bold text-lg btn-3d hover:from-green-400 hover:to-emerald-500 flex items-center justify-center gap-2"
            @click="handleRestart"
          >
            <span class="text-xl">🪺</span>
            再来一窝！
          </button>
          <button
            class="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl
                   font-bold text-lg btn-3d hover:from-slate-500 hover:to-slate-600 flex items-center justify-center gap-2"
            @click="handleHome"
          >
            <span class="text-xl">🏠</span>
            返回主页
          </button>
        </div>
      </div>

      <div class="text-center mt-6 text-white/40 text-sm">
        🌸 感谢游玩！希望你和小鸟们都收获了快乐~
      </div>
    </div>
  </div>
</template>
