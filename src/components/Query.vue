<script setup lang="ts">
import { getLocalString, locale } from './clientLocaleData';
import { watchIgnorable, until } from '@vueuse/core';
import { ref, type Ref, onMounted, useTemplateRef, onUnmounted } from 'vue';
import Fuse from 'fuse.js';

import HighlightAPIWarning from './HighlightAPIWarning.vue';
import Highlight from './Highlight.vue';
import QueryFilter from './QueryFilter.vue';

await until(window.queryReady).toMatch(v => v); // wait for the query to be ready

const { query, parseQuery, ignoreQueryUpdates, startWatchers, stopWatchers } = window.query;
const images = await Object.fromEntries(await Promise.all(
    Object.entries(import.meta.glob<typeof import("*.jpg")>(`../content/image/**/*`)).map(async ([key, image]) => [key, (await image()).default])
));

const queryTop = useTemplateRef('query-top'); // the top of the query result
const perPage = ref(10); // items per page
const pageCount = ref(0); // total page count
const loading = ref(true); // loading state
const result: Ref<Array<{ [key: string]: any }>> = ref([]); // search result

const props = defineProps<{
    path?: string
    item?: string
}>();

const getCollection = () => {
    let result = (globalThis.posts as Array<any>).map(e => ({...e})); // deep copy

    // first filter from the path and item
    if (props.path && props.item) {
        result = result.filter((e: any) => {
            // uncategorized
            if (props.path === "category" && props.item === getLocalString("CATEGORY_UNCATEGORIZED") && !e.categories) {
                return true;
            }
            
            // check normal category or tag
            return e[props.path!.replace("category", "categories").replace("tag", "tags")]?.includes(props.item);
        });
    }

    // and then filter from the query
    if (query.category && query.category.length > 0) {
        result = result.filter((e: any) => {
            return e.categories?.includes(...query.category!) 
            || (query.category!.includes(getLocalString("CATEGORY_UNCATEGORIZED")) && !e.categories);
        });
    }
    if (query.tag && query.tag.length > 0) {
        result = result.filter((e: any) => e.tags?.includes(...query.tag!));
    }

    // sort
    result = result.sort((a: any , b: any) => Date.parse(b.pubDate) - Date.parse(a.pubDate));

    if (query.keyword) {
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

        return fuse.search(query.keyword).map((e => Object.assign(e.item as any, { matches: e.matches })));
    }

    return result;
}

const getRelativeURL = (url: string) => {
    return new URL(url, new URL(window.SITE_BASE, window.location.origin)).pathname;
}

// parse query on mounted
onMounted(() => ignorePageUpdatesInQueryComponent(() => ignoreQueryUpdates(() => {
    startStateWatcher(); // start watching state changes
    startWatchers(); // start watching query changes
    parseQuery(); // parse query

    // i just want to show the skeleton for a while cause i already designed it :D
    // The data is not requested from the server asynchronously, so it's not necessary to show the skeleton.
    setTimeout(() => {
        loading.value = false;
    }, Math.random() * 1000); // random to make it more natural
})));

onUnmounted(() => {
    stopPageWatcherInQueryComponent(); // stop watching page changes
    stopWatchers(); // stop watching query changes
    stopStateWatcher(); // stop watching state changes
}); // stop watching query changes

// listen to popstate, pushstate (history navigation). parse query on change
const startStateWatcher = () => {
    ['popstate', 'pushstate'].map(e => window.addEventListener(e, () => parseQuery()));
}

const stopStateWatcher = () => {
    ['popstate', 'pushstate'].map(e => window.removeEventListener(e, () => parseQuery()));
}

const { ignoreUpdates: ignorePageUpdatesInQueryComponent, stop: stopPageWatcherInQueryComponent } = watchIgnorable(() => query.page, () => {
    // wait for the page to be updated
    setTimeout(() => {
        window.HSStaticMethods.autoInit();
        queryTop.value?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
});
</script>

<template>
    <div ref="query-top"></div>
    <div class="pt-5">
        <HighlightAPIWarning client:only="vue" />
    </div>
    
    <QueryFilter />

    <!-- Card Grid -->
    <div class="py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12" :set="result = getCollection()">

        <!-- Skeleton -->
        <div class="flex flex-col animate-pulse" v-for="i in 2" :key="i" v-if="loading">
            <div class="w-full h-48 bg-gray-200 rounded-2xl dark:bg-neutral-700"></div>

            <div class="pt-5 w-full">
                <div class="space-y-2">
                    <div class="w-[40%] h-4 bg-gray-200 rounded-full dark:bg-neutral-700 text-opacity-0"></div>
                    <div class="w-[60%] h-5 bg-gray-200 rounded-full dark:bg-neutral-700 text-opacity-0"></div>
                </div>

                <ul class="mt-3 space-y-2">
                    <li class="w-full h-4 bg-gray-200 rounded-full dark:bg-neutral-700"></li>
                    <li class="w-full h-4 bg-gray-200 rounded-full dark:bg-neutral-700"></li>
                    <li class="w-full h-4 bg-gray-200 rounded-full dark:bg-neutral-700"></li>
                    <li class="w-[20%] h-4 bg-gray-200 rounded-full dark:bg-neutral-700"></li>
                </ul>
            </div>
        </div>
        <!-- End Skeleton -->

        <a class="group flex flex-col focus:outline-none" :href="getRelativeURL(`article/${item.slug}`)" v-for="item in result.slice(
            (query.page! - 1) * perPage,
            query.page! * perPage
        )" :key="item.slug" v-else>
            <div class="aspect-w-16 aspect-h-12 overflow-hidden bg-gray-100 rounded-2xl dark:bg-neutral-800">
                <img class="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out object-cover rounded-2xl w-full" :alt="item.title" v-bind="images[`../content/image/${item.heroImage?.replace(/^\/|\/$/g, '')}`]!" />
            </div>

            <div class="pt-4">
                <p class="text-sm text-gray-600 dark:text-neutral-400">
                    {{
                        item.updatedDate ?
                        new Date(Date.parse(item.updatedDate)).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }) :
                        new Date(Date.parse(item.pubDate)).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })
                    }}
                </p>
                <h3 class="relative inline-block font-medium text-lg text-black before:absolute before:bottom-0.5 before:start-0 before:-z-[1] before:w-full before:h-1 before:bg-momo dark:before:bg-byakuroku before:transition before:origin-left before:scale-x-0 group-hover:before:scale-x-100 dark:text-white">
                    <Highlight :value="title.value" :indices="title.indices" v-for="(title, i) in item.matches.filter((e: any) => e.key === 'title')" v-if="item.matches?.some((e: any) => e.key === 'title')" :key="`${title.value}-${i}`" />
                    <span v-else>{{ item.title }}</span>
                </h3>
                <p class="mt-1 text-gray-600 dark:text-neutral-400">
                    <Highlight :value="description.value" :indices="description.indices" v-for="(description, i) in item.matches.filter((e: any) => e.key === 'description')" v-if="item.matches?.some((e: any) => e.key === 'description')" :key="`${description.value}-${i}`" />
                    <span v-else>{{ item.description }}</span>
                </p>

                <div class="mt-3 flex flex-wrap gap-2">
                    <span class="py-1.5 px-3 bg-white text-gray-600 border border-gray-200 text-xs sm:text-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" v-for="category in item.categories" :key="category">
                        {{ category }}
                    </span>
                </div>
            </div>
        </a>
        <span v-if="result.length === 0">{{ getLocalString('QUERY_NO_RESULT') }}</span>
    </div>
    <!-- End Card Grid -->

    <!-- Pagination Normal -->
    <nav class="justify-between items-center gap-x-1 hidden sm:flex" aria-label="Pagination" :set="pageCount = Math.ceil(result.length / perPage)">
        <!-- Previous -->
        <button type="button" class="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex jusify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" aria-label="Previous" :disabled="query.page === 1 || !pageCount" @click="query.page--">
            <iconify-icon icon="mingcute:left-fill" inline></iconify-icon>
            <span aria-hidden="true" class="hidden sm:block">{{ getLocalString('QUERY_PAGINATION_PREVIOUS') }}</span>
        </button>
        <!-- End Previous -->

        <!-- Page Number -->
        <div class="flex items-center gap-x-1">
            <template v-for="i in pageCount" :key="i">

                <!-- Ellipsis -->
                <template v-if="Math.abs(i - query.page!) > 2 && !(i === pageCount || i === 1)">
                    <div class="hs-tooltip inline-block relative group/dropdown" tabindex="0" ref="pageNumber" v-show="i === pageCount - 1 || i === query.page! - 3">
                        <button type="button" class="hs-tooltip-toggle group/button min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-400 hover:text-blue-600 p-2 text-sm rounded-lg focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-500 dark:hover:text-blue-500 dark:focus:bg-white/10">
                            <span class="group-hover/button:hidden group-focus/button:hidden text-xs">•••</span>
                            <iconify-icon class="group-hover/button:flex group-focus/button:flex hidden shrink-0 size-5 items-center" icon="mingcute:arrows-left-fill" width="24" height="24" inline v-if="query.page! > i"></iconify-icon>
                            <iconify-icon class="group-hover/button:flex group-focus/button:flex hidden shrink-0 size-5 items-center" icon="mingcute:arrows-right-fill" width="24" height="24" inline v-else></iconify-icon>
                            <span class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-neutral-700" role="tooltip">
                                {{ query.page! > i ? 'Previous' : 'Next' }} {{ query.page! > i ? i - 1 : i - query.page! - 2 }} page{{ Math.abs(i - query.page!) > 1 ? 's' : '' }}
                            </span>
                        </button>
                        <!-- Dropdown Wrapper -->
                        <div class="bottom-full absolute mt-2 z-50 max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700 hidden group-focus-within/dropdown:block group-[:not(:hover)]/dropdown:!hidden">
                            <!-- Option -->
                            <div class="py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" v-for="item in (query.page! > i ? i - 1 : i - query.page! - 2)" :key="item" @click="query.page = item; (<Array<HTMLDivElement>><unknown>$refs.pageNumber).forEach(e => e.blur())">
                                <div class="flex items-center">
                                    <div>
                                        <div class="text-sm font-semibold text-gray-800 dark:text-neutral-200">{{ query.page! > i ? item + 1 : item + query.page! + 2 }}</div>
                                    </div>
                                </div>
                            </div>
                            <!-- End Option -->
                        </div>
                        <!-- End Dropdown Wrapper -->
                    </div>
                </template>
                <!-- End Ellipsis -->

                <!-- Page Number -->
                <button type="button" class="min-h-[38px] min-w-[38px] flex justify-center items-center bg-gray-200 text-gray-800 py-2 px-3 text-sm rounded-lg focus:outline-none focus:bg-gray-300 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-600 dark:text-white dark:focus:bg-neutral-500" aria-current="page" @click="query.page = i" v-else-if="query.page === i">{{ i }}</button>
                <button type="button" class="min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-3 text-sm rounded-lg focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" @click="query.page = i" v-else>{{ i }}</button>
                <!-- End Page Number -->
            </template>
        </div>
        <!-- End Page Number -->

        <!-- Next -->
        <button type="button" class="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex jusify-center items-center gap-x-2 text-sm rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" :disabled="query.page === pageCount || !pageCount" @click="query.page++">
            <span aria-hidden="true" class="hidden sm:block">{{ getLocalString('QUERY_PAGINATION_NEXT') }}</span>
            <iconify-icon icon="mingcute:right-fill" inline></iconify-icon>
        </button>
        <!-- End Next -->
    </nav>
    <!-- End Pagination Normal -->

    <!-- Pagination Mobile -->
    <nav class="flex items-center justify-end gap-x-1 sm:hidden relative" aria-label="Pagination">
        <button type="button" class="min-h-[32px] min-w-8 py-2 px-2 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" aria-label="Previous" :disabled="query.page === 1" @click="query.page--">
            <iconify-icon icon="mingcute:left-fill" inline></iconify-icon>
            <span class="sr-only">{{ getLocalString('QUERY_PAGINATION_PREVIOUS') }}</span>
        </button>
        <div class="group" tabindex="0" ref="pageNumberMobile">
            <div class="flex items-center gap-x-1">
                <span class="min-h-[32px] min-w-8 flex justify-center items-center border border-gray-200 text-gray-800 py-1 px-3 text-sm rounded-full focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-white dark:bg-white/10">{{ query.page }}</span>
                <span class="min-h-[32px] flex justify-center items-center text-gray-500 py-1.5 px-1.5 text-sm dark:text-neutral-500">of</span>
                <span class="min-h-[32px] flex justify-center items-center text-gray-500 py-1.5 px-1.5 text-sm dark:text-neutral-500">{{ pageCount }}</span>
            </div>
            <!-- Dropdown Wrapper -->
            <div class="bottom-full my-2 absolute mt-2 z-50 max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700 hidden group-focus-within:block">
                <!-- Option -->
                <div class="py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" v-for="item in pageCount" :key="item" @click="query.page = item; $refs.pageNumberMobile.blur()">
                    <div class="flex items-center">
                        <div>
                            <div class="text-sm font-semibold text-gray-800 dark:text-neutral-200">{{ item }}</div>
                        </div>
                    </div>
                </div>
                <!-- End Option -->
            </div>
            <!-- End Dropdown Wrapper -->
        </div>
        <button type="button" class="min-h-[32px] min-w-8 py-2 px-2 inline-flex justify-center items-center gap-x-2 text-sm rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10" aria-label="Next" :disabled="query.page === pageCount" @click="query.page++">
            <span class="sr-only">{{ getLocalString('QUERY_PAGINATION_NEXT') }}</span>
            <iconify-icon icon="mingcute:right-fill" inline></iconify-icon>
        </button>
    </nav>
    <!-- End Pagination Mobile-->
</template>
