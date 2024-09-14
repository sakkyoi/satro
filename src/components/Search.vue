<script setup lang="ts">
import { getLocalString } from './clientLocaleData';
import { ref, type Ref, useTemplateRef, reactive, onMounted } from 'vue';
import Fuse from 'fuse.js';
import { type IStaticMethods, HSOverlay } from "preline/preline";

import HighlightAPIWarning from './HighlightAPIWarning.vue';
import Highlight from './Highlight.vue';import type { QueryReturn } from './query.d';

declare global {
    interface Window {
        HSStaticMethods: IStaticMethods
        query: QueryReturn
        SITE_BASE: string
    }

    var posts: Array<{ [key: string]: any }>
}

const { query, navigateWithQuery } = (window as any).query;

const props = defineProps<{
    path?: string
    item?: string
}>();

const search = ref('');
const result: Ref<Array<{ [key: string]: any }>> = ref([]);

const filter = reactive({
    path: props.path,
    item: props.item,
});

const searchModal = useTemplateRef('search-modal');

const getCollection = () => {
    let result = globalThis.posts.map(e => ({...e})); // deep copy

    // filter by path and item
    if (filter.path && filter.item) result = result.filter((e: any) => e[filter.path!.replace("category", "categories").replace("tag", "tags")]?.includes(filter.item));

    if (search.value) {
        const fuse = new Fuse(result, {
            keys: [
                "title",
                "description",
            ],
            includeMatches: true,
            includeScore: true,
            findAllMatches: true,
            useExtendedSearch: true,
        });

        result = fuse.search(search.value).map((e => Object.assign(e.item as any, { matches: e.matches })));
    }

    return result;
}

const proceedSearch = () => {
    if (!search.value) return;

    navigateWithQuery({
        keyword: search.value,
        category: [],
        tag: [],
        page: 1
    }, !filter.path ? window.SITE_BASE : undefined);

    search.value = '';
}

const clearFilter = () => {
    filter.path = undefined;
    filter.item = undefined;
}

const getRelativeURL = (url: string) => {
    return new URL(url, new URL(window.SITE_BASE, window.location.origin)).pathname;
}

onMounted(async () => {
    setTimeout(() => {
        window.HSStaticMethods.autoInit();
    }, 100);
});
</script>

<template>
    <div class="flex justify-center mt-5">
        <div class="flex-1 relative max-w-sm">
            <div class="absolute w-full h-full z-40 cursor-pointer" @click="HSOverlay.open(searchModal!)"></div>
            <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
                <iconify-icon class="shrink-0 size-4 text-gray-400 dark:text-white/60" icon="pixelarticons:search" width="1rem" height="1rem"></iconify-icon>
            </div>
            <input class="py-3 ps-10 pe-4 block w-full rounded-lg text-sm border-sumi/10 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500" tabindex="-1" type="text" role="combobox" aria-expanded="false" :placeholder="query.keyword || getLocalString('SEARCH')" value="" data-hs-combo-box-input="" />
            <div class="absolute inset-y-0 end-0 flex items-center pe-3.5 z-50 cursor-pointer" v-if="query.keyword" @click="query.keyword = ''">
                <iconify-icon icon="mingcute:close-circle-fill"></iconify-icon>
            </div>
        </div>
    </div>

    <div id="search-modal" ref="search-modal" class="hs-overlay hidden size-full fixed top-0 start-0 z-[100] overflow-x-hidden overflow-y-auto pointer-events-none" role="dialog" tabindex="-1" aria-labelledby="search-modal-label">
        <div class="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-3xl sm:w-full m-3 sm:mx-auto min-h-[calc(100%-3.5rem)] flex items-center">
            <div class="w-full flex flex-col bg-white shadow-lg rounded-xl dark:bg-neutral-900 pointer-events-auto">
                <div class="p-4 sm:p-14 !pb-5 text-center overflow-y-auto">
                    <iconify-icon id="search-modal-label" class="mb-4 w-20 h-auto mx-auto" icon="pixelarticons:search" width="72" height="63" fill="none"></iconify-icon>

                    <HighlightAPIWarning client:only="vue" />

                    <div class="opacity-60 flex items-center justify-center" v-if="filter.path && filter.item">
                        {{
                            getLocalString('SEARCHING_CATEGORY_OR_TAG_TIP')
                                .replace('{name}', filter.path === 'category' ? getLocalString('CATEGORY') : getLocalString('TAG'))
                                .replace('{keyword}', filter.item)
                        }}
                        <iconify-icon icon="pixelarticons:close" class="cursor-pointer ml-2" @click="clearFilter()"></iconify-icon>
                    </div>
                    <input type="text" class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-0 focus:ring-0 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" :placeholder="filter.path && filter.item ? getLocalString('SEARCH_PLACEHOLDER_SEARCHING_CATEGORY_OR_TAG_TIP').replace('{name}', filter.path === 'category' ? getLocalString('CATEGORY') : getLocalString('TAG')).replace('{keyword}', filter.item) : getLocalString('SEARCH_PLACEHOLDER')" autofocus v-model="search" />

                    <ul class="flex flex-col border-t-[1px] pt-2" :set="result = getCollection()">
                        <span class="text-left text-xs opacity-40">{{ getLocalString('QUICK_SEARCH') }}</span>
                        <li class="inline-flex items-center text-start gap-x-2 py-3 px-4 text-sm font-medium text-gray-800 dark:text-white hover:bg-keshizumi/10 rounded-xl" v-for="item in result.slice(0, 5)" :key="`${item.slug}`">
                            <a class="flex flex-col w-full" :href="getRelativeURL(`article/${item.slug}`)">
                                <Highlight :value="title.value" :indices="title.indices" v-for="(title, i) in item.matches.filter((e: any) => e.key === 'title')" v-if="item.matches?.some((e: any) => e.key === 'title')" :key="`${title.value}-${i}`" />
                                <span v-else>{{ item.title }}</span>
                                
                                <span class="text-gray-700/60 dark:text-white/60 text-xs">
                                    <Highlight :value="description.value" :indices="description.indices" v-for="(description, i) in item.matches.filter((e: any) => e.key === 'description')" v-if="item.matches?.some((e: any) => e.key === 'description')" :key="`${description.value}-${i}`" />
                                    <template v-else>{{ item.description }}</template>
                                </span>
                            </a>
                        </li>
                        <span v-if="result.length === 0">{{ getLocalString('QUICK_SEARCH_NO_RESULT') }}</span>
                    </ul>
                </div>

                <div class="flex items-center">
                    <button type="button" class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-es-xl border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:hover:text-white dark:focus:text-white" data-hs-overlay="#search-modal">
                        {{ getLocalString('CLOSE') }}
                    </button>
                    <button type="button" class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-ee-xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#search-modal" @click="proceedSearch()">
                        {{ getLocalString('SEARCH') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
