import { navigate } from 'astro:transitions/client';
import { ref, reactive } from 'vue';
import { watchIgnorable } from '@vueuse/core';

import { atob, btoa } from './patchedB64';
import { getLocalString } from './clientLocaleData';

import type { query } from './query.d';

export default function Query() {
    const watching = ref(false);
    const locked = ref(false);

    /**
     * stop all the watchers
     * @returns void
     */
    const stopWatchers = () => watching.value = false;

    /**
     * start all the watchers
     * @returns void
     */
    const startWatchers = () => watching.value = true;

    const query: query = reactive({
        category: [],
        tag: [],
        page: 1,
    });

    // when query is updated, update the url (if it's a url parsing, remember to use ignoreQueryUpdates)
    let { ignoreUpdates: ignoreQueryUpdates } = watchIgnorable(() => query, () => {
        if (!watching.value || locked.value) return;

        stringifyQuery();
    }, { deep: true });

    // when category, tag, or keyword is updated, reset the page to 1 (if it's a url parasing, remember to use ignoreCategoryAndTagUpdates)
    let { ignoreUpdates: ignoreCategoryAndTagUpdates } = watchIgnorable(() => [query.category, query.tag, query.keyword], () => {
        if (!watching.value || locked.value) return;

        query.page = 1;
    });

    /**
     * lock the query updates when the page is swapping
     * this is to prevent the query updates when swapping between query and article
     * popstate, pushstate will early trigger than Query Unmount.
     * 
     * this is a workaround!
     * 
     * TODO: swapping still not working properly if the article's url have hash.
     */
    document.addEventListener('astro:before-swap', () => {
        locked.value = true;
    });

    /**
     * listen to popstate, pushstate (history navigation). parse query on change
     */
    ['popstate', 'pushstate'].map(e => window.addEventListener(e, () => {
        if (!watching.value || locked.value) {
            locked.value = false; // unlock the query updates
            return;
        }

        parseQuery();
    }));

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
    const parseQuery = () => {
        const queryString = window.location.hash.substring(1);
        if (!queryString) {
            // reset the query if the query string is empty
            ignoreQueryUpdates(() => ignoreCategoryAndTagUpdates(() => resetQuery()));
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
    const stringifyQuery = (replace: boolean = false) => {
        navigate(`#${btoa(JSON.stringify(query))}`, { history: replace ? 'replace' : 'push' });
    }

    /**
     * manually navigate to a new query (with search component)
     * @param newQuery the new query to be assigned
     * @param target the target path to navigate to (optional)
     */
    const navigateWithQuery = (newQuery: query, target?: string) => {
        // just ignore the query updates cause we want the page to be reset to 1
        ignoreQueryUpdates(() => assignQuery(newQuery));
        
        if (target) navigate(target).then(() => stringifyQuery(true));
        else stringifyQuery();
    }

    window.dispatchEvent(new Event('queryReady')); // dispatch the query ready event

    return {
        query,
        watching,
        locked,
        parseQuery,
        stringifyQuery,
        navigateWithQuery,
        startWatchers,
        stopWatchers,
        ignoreQueryUpdates,
    }
}
