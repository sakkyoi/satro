import { navigate } from 'astro:transitions/client';
import { ref, reactive, watch } from 'vue';

import { atob, btoa } from './patchedB64';
import { getLocalString } from './clientLocaleData';

import type { query } from './query.d';

export default function Query() {
    const watching = ref(false); // whether the query is being watched
    const locked = ref(false); // whether the query is locked (prevent updates)
    const startWatchers = () => watching.value = true;
    const stopWatchers = () => watching.value = false;
    const lock = () => locked.value = true;
    const unlock = () => locked.value = false;

    // store of the query data
    const query: query = reactive({
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
     * stringify the query and update the url
     * @returns void
     */
    const stringifyQuery = (replace: boolean = false) => {
        const queryString = btoa(JSON.stringify(query));
        navigate(`#${queryString}`, { history: replace ? 'replace' : 'push' });
    }

    /**
     * watch the query updates, update query string
     */
    watch(() => query, () => {
        if (!watching.value || locked.value) return;

        stringifyQuery();
    }, { deep: true });

    /**
     * watch category, tag, set the page to 1
     */
    watch(() => [query.category, query.tag], () => {
        if (!watching.value || locked.value) {
            unlock(); // unlock the query updates
            return;
        }
    
        query.page = 1;
    }, { deep: true });

    window.addEventListener('hashchange', () => {
        if (!watching.value) return;
        parseQuery();
    });

    const blockQueryUpdates = (fn: () => void) => {
        lock(); // lock the query updates, unlock after category/tag watcher
        fn();
    }

    /**
     * parse the query from the url
     * @returns void
     */
    const parseQuery = () => {
        const queryString = window.location.hash.substring(1);
        if (!queryString) {
            // reset the query if the query string is empty
            blockQueryUpdates(() => assignQuery());
            return;
        }
        
        try {
            const parse = JSON.parse(atob(window.location.hash.substring(1)));
            // prevent page reset with ignore function
            blockQueryUpdates(() => assignQuery(parse));
        } catch {
            alert(getLocalString('QUERY_STRING_BROKEN_ALERT'));
            blockQueryUpdates(() => assignQuery(query));
            stringifyQuery(true);
            console.warn('invalid query string, but we reset the page for you');
        }
    }

    /**
     * manually navigate to a new query (with search component)
     * @param newQuery the new query to be assigned
     * @param target the target path to navigate to (optional)
     */
    const navigateWithQuery = (newQuery: query, target?: string) => {
        // just ignore the query updates cause we want the page to be reset to 1
        blockQueryUpdates(() => assignQuery(newQuery));
        
        if (target) navigate(target).then(() => stringifyQuery(true));
        else stringifyQuery();
    }

    window.dispatchEvent(new Event('queryReady')); // dispatch the query ready event

    return {
        query,
        parseQuery,
        navigateWithQuery,
        startWatchers,
        stopWatchers,
    }
}
