<template>
  <div class="grid px-4">
    <div
      v-for="(item, i) in value"
      :class="{
        ...$xClass('py-4 flex flex-wrap gap-2', classes?.item),
        'border-b border-neutral-700/60': i < value.length - 1,
      }"
    >
      <template v-for="(val, key) in item">
        <div
          v-if="key + '' !== '__index'"
          class="px-2 py-1 leading-tight flex items-baseline bg-neutral-900/80 rounded gap-2"
        >
          <p class="text-xs text-neutral-400">{{ key }}</p>
          <p class="text-sm">{{ val }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XClass } from 'senp-ui/src/plugins/xClass'

defineProps<{
  value: any[]
  classes?: {
    item: XClass
  }
}>()
</script>
