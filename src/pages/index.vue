<template>
  <SenpLayoutBasic
    fixed-header
    :classes="{
      header: {
        extend: 'text-sm sm:text-xl md:text-2xl bg-black/20 backdrop-blur border-b border-neutral-800/60 shadow',
      },
      footer: {
        extend: 'hidden',
      },
    }"
  >
    <template #header>
      <div class="flex items-center gap-1.5 sm:gap-3">
        <img src="@/assets/logo.png" class="w-8 h-8 sm:w-14 sm:h-14" alt="" />
        <p class="tracking-wide">Dataviewer</p>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-3">
        <SenpSelect
          :classes="{
            input: { extend: 'text-xs sm:text-sm !border-neutral-800 bg-neutral-900/75 sm:!bg-transparent' },
          }"
          v-if="state.sheetNames.length > 1"
          :model-value="state.activeSheetIndex + ''"
          @update:model-value="
            (v) => {
              $router.replace({ path: '', query: { sheetIndex: v } })
            }
          "
          placeholder="-- Select a sheet --"
          :options="state.sheetNames.map((sheet, i) => ({ value: i + '', label: sheet }))"
        ></SenpSelect>
        <a
          :class="{ 'hidden sm:flex': state.sheetNames.length > 1, 'flex text-xl': state.sheetNames.length <= 1 }"
          href="https://github.com/nicolehollant/dataviewer"
          target="_blank"
          rel="noopener noreferrer"
          class="h-max items-center text-neutral-200 hover:text-blue-400 transition"
          ><Icon name="mdi:github"></Icon
        ></a>
      </div>
    </template>

    <template #content>
      <div class="flex gap-2 items-center justify-center flex-1" v-if="!state.files">
        <SenpFileInput
          v-model="state.files"
          @update:model-value="processFileContent"
          read-as="array-buffer"
          :classes="{
            dropZone: { extend: 'w-full h-full relative overflow-hidden' },
            draggedOver: 'bg-gradient-to-br transition duration-300 bg-green-900 from-neutral-800',
            default: 'bg-gradient-to-br transition duration-300 bg-neutral-900 from-neutral-800',
          }"
          class="w-full h-full"
          hide-files
        >
          <template #dropzone="{ draggedOver }">
            <div class="flex flex-col items-center justify-center gap-2 text-center h-full relative z-20">
              <div
                class="max-w-2xl flex flex-col gap-2 items-center justify-center px-16 py-8 rounded-2xl bg-zinc-800/40 shadow-lg border border-black/20 backdrop-blur-md"
              >
                <p class="text-xl leading-relaxed">
                  Drag and drop to upload a spreadsheet to launch configurable viewer
                </p>
                <p class="text-xs text-neutral-500">or</p>
                <p>
                  <span class="text-green-300 transition duration-200 group-hover:text-green-400 group-hover:underline"
                    >click</span
                  >
                  to upload
                </p>
                <p class="text-xs italic text-neutral-400">
                  Accepts most spreadsheet formats (xlsx, numbers, csv, tsv, and more)
                </p>
              </div>
            </div>
            <div class="absolute -inset-2 z-10">
              <img
                src="@/assets/bg-asset-1.png"
                alt=""
                :class="{ 'blur-sm scale-110 translate-y-4 translate-x-4 saturate-100': draggedOver }"
                class="opacity-20 object-cover object-[50%_15%] w-full h-full filter brightness-75 saturate-50 transition-all duration-500 transform"
              />
            </div>
          </template>
        </SenpFileInput>
      </div>
      <SenpDataView
        v-if="state.activeSheetIndex != null && state.sheets.length - 1 >= state.activeSheetIndex"
        :key="state.activeSheetIndex"
        :data="state.sheets[state.activeSheetIndex]"
        key-field="__index"
        :initialFilters="state.sheetSettings[state.activeSheetIndex].initialFilters"
        :initialSorters="state.sheetSettings[state.activeSheetIndex].initialSorters"
        :initialState="state.sheetSettings[state.activeSheetIndex].initialState"
        :initialSettings="state.sheetSettings[state.activeSheetIndex].initialSettings"
      ></SenpDataView>
      <section v-else class="grid md:grid-cols-2 gap-4 md:gap-8">
        <div
          class="px-4 py-2 md:px-6 md:py-4 rounded-lg grid gap-2 sm:gap-4 bg-neutral-900 border border-neutral-800"
          v-for="(sheet, i) in state.sheetNames"
        >
          <h3 class="text-base sm:text-xl">{{ sheet }}</h3>
          <div class="relative h-64 text-xs overflow-hidden rounded-lg bg-neutral-800/80">
            <DataviewPreview :value="state.sheetPreviews[i]" class="overflow-auto h-full"></DataviewPreview>
            <p
              class="bg-neutral-700/50 backdrop-blur text-neutral-300 rounded-full leading-none font-medium px-2 py-1 shadow absolute top-2 right-2"
            >
              preview
            </p>
          </div>
          <NuxtLink custom v-slot="{ navigate }" :to="{ path: '', query: { sheetIndex: i } }">
            <SenpButton class="text-sm sm:text-base" @click="navigate">Select Sheet {{ i + 1 }}</SenpButton>
          </NuxtLink>
        </div>
      </section>
    </template>
  </SenpLayoutBasic>
</template>

<script setup lang="ts">
import XLSX from 'xlsx'
const state = reactive({
  files: null,
  sheetNames: [] as string[],
  sheets: [] as any[],
  activeSheetIndex: undefined as number | undefined,
  sheetPreviews: [] as any[],
  sheetSettings: [] as any[],
  error: '',
})

const route = useRoute()
const router = useRouter()

watch(
  () => route.query,
  () => {
    const _activeSheetIndex = route.query.sheetIndex != null ? Number(route.query.sheetIndex) : null
    if (_activeSheetIndex != null && route.query?.dv) {
      state.sheetSettings[_activeSheetIndex].initialSettings = route.query.dv
    }
    if (_activeSheetIndex != null && route.query?.f) {
      state.sheetSettings[_activeSheetIndex].initialFilters = route.query.f
    }
    if (_activeSheetIndex != null && route.query?.s) {
      state.sheetSettings[_activeSheetIndex].initialSorters = route.query.s
    }
    if (_activeSheetIndex != null && route.query?.st) {
      state.sheetSettings[_activeSheetIndex].initialState = route.query.st
    }
    if (route.query?.sheetIndex) {
      nextTick(() => {
        state.activeSheetIndex = Number(route.query.sheetIndex)
      })
    } else {
      nextTick(() => {
        state.activeSheetIndex = undefined
      })
    }
  },
  { deep: true }
)
const processFileContent = (fileData: any) => {
  try {
    const workbook = XLSX.read(fileData, { raw: true })
    const result = workbook.SheetNames.map((a) => XLSX.utils.sheet_to_json(workbook.Sheets[a as any]))
    state.sheets = (result as any).map((sheet: any) => sheet.map((a: any, i: number) => ({ ...a, __index: i + 1 })))
    state.sheetPreviews = (result as any).map((sheet: any) =>
      sheet.slice(0, 5).map((a: any, i: number) => ({ ...a, __index: i + 1 }))
    )
    state.sheetNames = workbook.SheetNames
    state.sheetSettings = workbook.SheetNames.map(() => ({
      initialFilters: undefined,
      initialSorters: undefined,
      initialSettings: undefined,
      initialState: undefined,
    }))
    if (workbook.SheetNames.length === 1) {
      state.activeSheetIndex = 0
    }
    state.error = ''
  } catch (error) {
    state.error = error + ''
  }
}

onMounted(() => {
  if (route.query && state.sheets.length === 0) {
    router.replace({ path: '', query: {} })
  }
})
</script>
