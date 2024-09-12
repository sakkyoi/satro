/**
 * The original btoa and atob functions are not support unicode characters.
 * This is a patched version of btoa and atob that supports unicode characters.
 */

export const btoa = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    return globalThis.btoa(String.fromCharCode(...bytes));
}

export const atob = (str: string) => {
    const bytes = globalThis.atob(str);
    return new TextDecoder().decode(new Uint8Array(bytes.split('').map(e => e.charCodeAt(0))));
}
