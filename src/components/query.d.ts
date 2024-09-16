import type { Ref, Reactive } from 'vue';
import type { IgnoredUpdater } from '@vueuse/core';

export type query = Reactive<{
    category: string[]
    tag: string[]
    keyword?: string
    page: number
}>;

export type parseQuery = () => void;
export type navigateWithQuery = (newQuery: query, target?: string) => void;
export type startWatchers = () => void;
export type stopWatchers = () => void;

export type QueryReturn = {
    query: query
    parseQuery: parseQuery
    navigateWithQuery: navigateWithQuery
    startWatchers: startWatchers
    stopWatchers: stopWatchers
}

export default function Query(): QueryReturn;
