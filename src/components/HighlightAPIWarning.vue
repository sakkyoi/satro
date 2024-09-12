<script setup lang="ts">
import { ref } from 'vue';
import { getLocalString } from './clientLocaleData';

const noHighlight = ref(!CSS.highlights); // check if highlight api is support
</script>

<template>
    <div class="bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg p-4 mb-5 dark:bg-yellow-800/10 dark:border-yellow-900 dark:text-yellow-500 text-left" role="alert" tabindex="-1" aria-labelledby="hs-with-description-label" v-if="noHighlight">
        <div class="flex">
            <div class="shrink-0">
                <iconify-icon class="shrink-0 size-4 mt-0.5 inline" icon="ph:warning-bold" width="24" height="24"></iconify-icon>
            </div>
            <div class="ms-4">
                <h3 id="hs-with-description-label" class="text-sm font-semibold">
                    {{ getLocalString('HIGHLIGHT_API_NOT_SUPPORTED_TIELE') }}
                </h3>
                <div class="mt-1 text-sm text-yellow-700" v-html="getLocalString('HIGHLIGHT_API_NOT_SUPPORTED_MESSAGE')"></div>
            </div>
        </div>
    </div>
</template>
