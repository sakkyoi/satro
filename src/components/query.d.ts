import type { Reactive } from 'vue';
import type { IgnoredUpdater } from '@vueuse/core';

export type query = Reactive<{
    category: string[]
    tag: string[]
    keyword?: string
    page: number
}>;
export type parseQuery = () => void;
export type stringifyQuery = (replace?: boolean) => void;
export type navigateWithQuery = (newQuery: query, target?: string) => void;
export type startWatchers = () => void;
export type stopWatchers = () => void;

export type QueryReturn = {
    query: query
    parseQuery: parseQuery
    stringifyQuery: stringifyQuery
    navigateWithQuery: navigateWithQuery
    startWatchers: startWatchers
    stopWatchers: stopWatchers
    ignoreQueryUpdates: IgnoredUpdater
}

export default function Query(): QueryReturn;
