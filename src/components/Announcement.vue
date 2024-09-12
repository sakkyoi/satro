<script setup lang="ts">
import { locale } from './clientLocaleData';
import { ref } from 'vue';

const props = defineProps<{
    slug: string
    title: string
    body: string
    pubDate: Date
}>();

const isHidden = ref(localStorage.getItem(`announcement-${props.slug}`) == 'true');

const remove = () => {
    localStorage.setItem(`announcement-${props.slug}`, 'true');
}
</script>

<template>
    <div :id="`announcement-${props.slug}`"class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 dark:bg-neutral-800 dark:border-neutral-700 relative" :class="{ 'hidden': isHidden }" role="alert" tabindex="-1" aria-labelledby="hs-discovery-label">
        <div class="flex">
            <div class="shrink-0">
                <iconify-icon class="shrink-0 size-4 text-blue-600 mt-1" icon="mingcute:information-line" inline></iconify-icon>
            </div>
            <div class="ms-3">
                <h3 id="hs-discovery-label" class="text-gray-800 font-semibold dark:text-white">
                    {{ props.title }}
                    <span class="text-sm text-gray-700 dark:text-neutral-400 ml-1">
                        ・{{
                            pubDate.toLocaleDateString(locale, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })
                        }}
                    </span>
                </h3>
                <p class="mt-2 text-md text-gray-700 dark:text-neutral-400">
                    {{ props.body }}
                </p>
            </div>
            <div class="absolute top-0 right-0 m-2 cursor-pointer opacity-70" :data-hs-remove-element="`#announcement-${props.slug}`" @click="remove()">
                <iconify-icon icon="mingcute:close-circle-line"></iconify-icon>
            </div>
        </div>
    </div>
</template>
