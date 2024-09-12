import { getLocalString } from "./langs/lang";

export const SITE_TITLE = import.meta.env.SITE_TITLE || getLocalString('CONSTS_SITE_NAME_UNTITLED');
export const SITE_DESCRIPTION = import.meta.env.SITE_DESCRIPTION || getLocalString('CONSTS_SITE_DESCRIPTION_UNSET');
