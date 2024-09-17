/// <reference path="../.astro/types.d.ts" />

interface Window {
    localeData: { [key: string]: string }
    locale: string
    HSStaticMethods: IStaticMethods
    HSScrollspy: HSScrollspy
    $hsScrollspyCollection: ICollectionItem<HSScrollspy>[]
    query: QueryReturn
    queryReady: Ref<boolean>
    SITE_BASE: string
}

var posts: Array<{ [key: string]: any }>
