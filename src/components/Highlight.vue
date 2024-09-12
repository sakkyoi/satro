<!--
Using the Highlight API to highlight the text.
Note that this may not work in some browsers. Please refer to the documentation below for more information.
https://developer.mozilla.org/en-US/docs/Web/API/Highlight
-->
<script setup lang="ts">
import { ref, useTemplateRef, onMounted, watch } from 'vue';

const props = defineProps<{
    value: string
    indices: Array<[ number, number ]>
}>();

const text = useTemplateRef('text');
const id = ref(`highlight-${[...'abcdefghijklmnopqrstuvwxyz'].sort(() => Math.random() - 0.5).join('').slice(0, 5)}`);

const processHighlight = () => {
    if (!CSS.highlights) return;

    const ranges = [];
    for (const [start, end] of props.indices) {
        const range = new Range();
        range.setStart(text.value!, start + 1);
        range.setEnd(text.value!, end + 2);
        
        ranges.push(range);
    }

    CSS.highlights.set(id.value, new Highlight(...ranges));
}

onMounted(() => processHighlight());
watch(() => props, () => processHighlight(), { deep: true });
</script>

<template>
    <span ref="text" class="">
        <span v-for="(ch, i) in [...value]" :key="`${i}`">{{ ch }}</span>
    </span>

    <component is="style">
        ::highlight({{ id }}) {
            background-color: #F9BF45;
        }
    </component>
</template>
