<script setup lang="ts">
import { getLocalString } from './clientLocaleData';

import { ref, type Ref, onMounted } from 'vue';
import { type IStaticMethods } from "preline/preline";

import TagSelect from './TagSelect.vue';
import type { QueryReturn } from './query.d';

declare global {
    interface Window {
		query: QueryReturn
    }
}

const { query } = window.query;

declare global {
    interface Window {
        HSStaticMethods: IStaticMethods;
    }
}

const categories: Ref<Array<string>> = ref([...new Set([...globalThis.posts].map(e => e.categories ?? getLocalString('CATEGORY_UNCATEGORIZED')).flat())]);
const tags: Ref<Array<string>> = ref([...new Set([...globalThis.posts].map(e => e.tags!).flat().filter(e => e))]);

onMounted(() => {
    setTimeout(() => {
        window.HSStaticMethods.autoInit();
    }, 100);
});
</script>

<style scoped>
@tailwind utilities;
@layer utilities {
    .filter-collapsed {
        @apply p-4 bg-white border border-t-4 border-t-blue-600 shadow-sm dark:bg-neutral-900 dark:border-neutral-700 dark:border-t-blue-500 dark:shadow-neutral-700/70;
    }
}
</style>

<template>
    <div class="w-full flex flex-col rounded-xl space-y-5 peer has-[button.open]:filter-collapsed">
        <h3 class="flex items-center text-lg font-bold text-gray-800 dark:text-white space-x-2">
            <button class="hs-collapse-toggle" id="filter-collapse" aria-expanded="false" aria-controls="filter-collapse-heading" data-hs-collapse="#filter-collapse-heading">
                <iconify-icon class="hs-collapse-open:!inline-block hidden" icon="mingcute:minimize-fill" inline></iconify-icon>
                <iconify-icon class="hs-collapse-open:!hidden" icon="mingcute:filter-line" inline></iconify-icon>
                {{ getLocalString('FILTER') }}
            </button>
            <button type="button" class="p-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" v-show="query.category.length !== 0 || query.tag.length !== 0" @click="query.category = query.tag = []">
                {{ getLocalString('FILTER_CLEAR') }}
                <iconify-icon class="shrink-0 size-4" icon="mingcute:delete-2-line" inline></iconify-icon>
            </button>
        </h3>
        
        <div id="filter-collapse-heading" class="hs-collapse hidden w-full transition-[height] duration-300 space-y-3 select-none" style="clip-path:" aria-labelledby="filter-collapse" @transitionstart="(ev) => (<HTMLElement>ev.target).classList.add('overflow-hidden', 'transition-start')" @transitionend="(ev) => (<HTMLElement>ev.target).classList.remove('overflow-hidden', 'transition-start')">
            <!-- Select Categories -->
            <div>
                <span class="block text-sm text-gray-700/60 font-medium dark:text-white/60">{{ getLocalString('CATEGORY') }}</span>
                <tag-select :options="categories" v-model="query.category" />
            </div>
            <!-- End Select Categories -->

            <!-- Select Tags -->
            <div>
                <span class="block text-sm text-gray-700/60 font-medium dark:text-white/60">{{ getLocalString('TAG') }}</span>
                <tag-select :options="tags" v-model="query.tag" />
            </div>
            <!-- End Select Tags -->
        </div>

    </div>

    <div class="peer-has-[button.open]:hidden [:not(peer-has-[.transition-start])]:hidden mt-5">
        <div class="flex flex-wrap items-center" v-show="query.category.length! > 0">
            <span>{{ getLocalString('FILTER_TIP').replace('{name}', getLocalString('CATEGORY')) }}</span>
            <span class="gap-x-1.5 py-1.5 px-3 m-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white" v-for="item in query.category" :key="item">{{ item }}</span>
        </div>

        <div class="flex flex-wrap items-center" v-show="query.tag.length! > 0">
            <span>{{ getLocalString('FILTER_TIP').replace('{name}', getLocalString('TAG')) }}</span>
            <span class="gap-x-1.5 py-1.5 px-3 m-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white" v-for="item in query.tag" :key="item">{{ item }}</span>
        </div>
    </div>
</template>
