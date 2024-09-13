import { navigate } from 'astro:transitions/client';
import { reactive, type Reactive } from 'vue';
import { watchIgnorable, type WatchIgnorableReturn } from '@vueuse/core';

import { atob, btoa } from './patchedB64';
import { getLocalString } from './clientLocaleData';

export const images = Object.fromEntries(await Promise.all(
    Object.entries(import.meta.glob<typeof import("*.jpg")>(`../content/image/**/*`)).map(async ([key, image]) => [key, (await image()).default])
));

export type query = Reactive<{
    category: string[]
    tag: string[]
    keyword?: string
    page: number
}>;

export const query: query = reactive({
    category: [],
    tag: [],
    page: 1,
});

/**
 * assign the new query to the current query
 * @param newQuery the new query to be assigned
 * @returns void
 */
const assignQuery = (newQuery?: query) => {
    query.category = newQuery?.category || [];
    query.tag = newQuery?.tag || [];
    query.keyword = newQuery?.keyword || '';
    query.page = newQuery?.page || 1;
}

/**
 * reset the query
 * @returns void
 */
const resetQuery = () => {
    assignQuery();
}

/**
 * parse the query from the url
 * @returns void
 */
export const parseQuery = () => {
    const queryString = window.location.hash.substring(1);
    if (!queryString) {
        // reset the query if the query string is empty
        ignoreQueryUpdates(() => resetQuery());
        return;
    }
    
    try {
        const parse = JSON.parse(atob(window.location.hash.substring(1)));
        // prevent page reset with ignore function
        ignoreQueryUpdates(() => ignoreCategoryAndTagUpdates(() => assignQuery(parse)));
    } catch {
        alert(getLocalString('QUERY_STRING_BROKEN_ALERT'));
        navigateWithQuery(query);
        console.warn('invalid query string, but we reset the page for you');
    }
}

// stringify the query and update the url
/**
 * stringify the query and update the url
 * @returns void
 */
export const stringifyQuery = (replace: boolean = false) => {
    navigate(`#${btoa(JSON.stringify(query))}`, { history: replace ? 'replace' : 'push' });
}

/**
 * manually navigate to a new query (with search component)
 * @param newQuery the new query to be assigned
 * @param target the target path to navigate to (optional)
 */
export const navigateWithQuery = (newQuery: query, target?: string) => {
    // just ignore the query updates cause we want the page to be reset to 1
    ignoreQueryUpdates(() => assignQuery(newQuery));
    
    if (target) navigate(target).then(() => stringifyQuery(true));
    else stringifyQuery();
}

/**
 * start the query watcher
 * @returns void
 */
const startQueryWatcher = () => {
    return watchIgnorable(() => query, () => {
        stringifyQuery();
    }, { deep: true });
}

/**
 * start the category and tag watcher
 * @returns void
 */
const startCategoryAndTagWatcher = () => {
    return watchIgnorable(() => [query.category, query.tag, query.keyword], () => {
        query.page = 1;
    });
}

/**
 * this is a placeholder for the watchIgnorable function
 */
const watchIgnorablePlaceholder: WatchIgnorableReturn = {
    ignoreUpdates: (ctx) => ctx(),
    stop: () => {},
    ignorePrevAsyncUpdates: () => {},
}

// when query is updated, update the url (if it's a url parsing, remember to use ignoreQueryUpdates)
export let { ignoreUpdates: ignoreQueryUpdates, stop: stopQueryWatcher }: WatchIgnorableReturn = watchIgnorablePlaceholder;

// when category, tag, or keyword is updated, reset the page to 1 (if it's a url parasing, remember to use ignoreCategoryAndTagUpdates)
export let { ignoreUpdates: ignoreCategoryAndTagUpdates, stop: stopCategoryAndTagWatcher }: WatchIgnorableReturn = watchIgnorablePlaceholder;

/**
 * stop all the watchers
 * @returns void
 */
export const stopWatchers = () => {
    stopQueryWatcher();
    stopCategoryAndTagWatcher();
}

/**
 * start all the watchers
 * @returns void
 */
export const startWatchers = () => {
    const queryWatcher = startQueryWatcher();
    ignoreQueryUpdates = queryWatcher.ignoreUpdates;
    stopQueryWatcher = queryWatcher.stop;

    const categoryAndTagWatcher = startCategoryAndTagWatcher();
    ignoreCategoryAndTagUpdates = categoryAndTagWatcher.ignoreUpdates;
    stopCategoryAndTagWatcher = categoryAndTagWatcher.stop;
}
