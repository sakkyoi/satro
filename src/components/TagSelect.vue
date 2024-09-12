<script setup lang="ts">
import { getLocalString } from './clientLocaleData';
import { ref, type Ref, type ModelRef } from 'vue';
import Fuse from 'fuse.js';

const props = defineProps<{
    options: string[]
}>();

const model: ModelRef<Array<string>> = defineModel({ required: true}); // selected options
const input: Ref<string> = ref('');
const filteredOptions: Ref<string[]> = ref([]);
const focused: Ref<boolean> = ref(false);

const toggle = (item: string) => {
    if (model.value.includes(item)) {
        model.value = model.value.filter(e => e !== item);
    } else {
        model.value.push(item);
    }

    input.value = '';
}

const isSelect = (item: string) => {
    return model.value.includes(item); // check if the item is selected
}

const getFilteredOptions = () => {
    if (input.value) {
        const fuse = new Fuse(props.options);
        return fuse.search(input.value).map(e => e.item);
    }

    return props.options; // return all options if input is empty
}
</script>

<template>
    <div class="relative ps-0.5 pe-9 min-h-[46px] flex items-center flex-wrap text-nowrap w-full border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 cursor-text" tabindex="0" :set="filteredOptions = getFilteredOptions()" @click="$refs.inputRef.focus()" @focusin="focused = true" @focusout="focused = false">
        <!-- Hidden Select -->
        <select class="hidden" v-model="model" multiple>
            <option v-for="item in props.options" :key="item" :value="item">{{ item }}</option>
        </select>
        <!-- End Hidden Select -->

        <!-- Input -->
        <div class="py-3 px-2 order-1 relative flex items-center">
            <input class="text-sm outline-none dark:bg-neutral-900 dark:placeholder-neutral-500 dark:text-neutral-400" v-model="input" ref="inputRef" @keypress.enter="input === '' || toggle(filteredOptions[0])" :placeholder="model.length === 0 ? getLocalString('TAG_SELECT_PLACEHOLDER') : ''" />
            <iconify-icon class="absolute left-2" icon="mingcute:add-fill" inline v-show="!focused && model.length !== 0"></iconify-icon>
        </div>
        <!-- End Input -->

        <!-- Tags -->
        <div class="flex flex-nowrap items-center relative z-10 bg-white border border-gray-200 rounded-full p-1 pl-2 m-1 dark:bg-neutral-900 dark:border-neutral-700 cursor-default" v-for="item in model" :key="item" tabindex="-1" @click.stop @focusin.stop @focusout.stop>
            <div class="whitespace-nowrap text-gray-800 dark:text-neutral-200">{{ item }}</div>
            <div class="inline-flex shrink-0 justify-center items-center size-5 ms-0.5 rounded-full text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm dark:bg-neutral-700/50 dark:hover:bg-neutral-700 dark:text-neutral-400 cursor-pointer" @click="toggle(item)">
                <iconify-icon class="shrink-0 size-3" icon="mingcute:close-fill" width="12" height="12"></iconify-icon>
            </div>
        </div>
        <!-- End Tags -->

        <!-- Dropdown Wrapper -->
        <div class="bottom-full my-2 absolute mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700 hidden" :class="{ '!block': focused }">
            <!-- Option -->
            <div class="py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800" v-for="item in filteredOptions" :key="item" @click="toggle(item)">
                <div class="flex items-center">
                    <div>
                        <div class="text-sm font-semibold text-gray-800 dark:text-neutral-200">{{ item }}</div>
                    </div>
                    <div class="ms-auto flex items-center" :class="[isSelect(item) ? 'block' : 'hidden']">
                        <iconify-icon class="size-4 text-blue-600" icon="mingcute:check-2-fill" width="16" height="16"></iconify-icon>
                    </div>
                </div>
            </div>
            <!-- End Option -->
            <div class="py-2 px-4 w-full text-sm text-gray-800 cursor-not-allowed rounded-lg dark:bg-neutral-900 dark:text-neutral-200" v-if="filteredOptions.length === 0">
                {{ getLocalString('TAG_SELECT_SEARCH_NOT_FOUND') }}{{ input }}
            </div>
        </div>
        <!-- End Dropdown Wrapper -->

        <div class="absolute top-1/2 end-3 -translate-y-1/2">
            <iconify-icon class="shrink-0 size-3.5 text-gray-500 dark:text-neutral-500 inline" icon="mingcute:selector-vertical-fill" width="24" height="24"></iconify-icon>
        </div>
    </div>
</template>
