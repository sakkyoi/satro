/**
 * This is a rehype plugin for mermaid.js to render the mermaid diagrams in the markdown.
 * 
 * This plugin needs to add the following code to the client side to work:
 * ```javascript
 * import mermaid from "mermaid";
 * 
 * mermaid.startOnLoad = false;
 * 
 * const observe = new MutationObserver(() => {
 * 	const isDark = window.document.documentElement.classList.contains("dark");
 * 
 * 	document.querySelectorAll(".mermaid").forEach((el) => {
 * 		const code = el.getAttribute("codedata");
 * 		if (code) {
 * 			el.innerHTML = code;
 * 			el.removeAttribute("data-processed");
 * 
 * 			mermaid.init({
 * 				theme: isDark ? "dark" : "base",
 * 				startOnLoad: true,
 * 			}, el as HTMLElement);
 * 		}
 * 	});
 * });
 * 
 * observe.observe(window.document.documentElement, {
 * 	attributes: true,
 * 	attributeFilter: ["class"],
 * });
 * ```
 */
import type { Root, Element, Text } from 'hast';
import { h } from 'hastscript';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

function isMermaid(node: Element): boolean {
    return node.tagName === 'pre' && (<Element>node.children[0])?.tagName === 'code' && (<Array<string>>(<Element>node.children[0])?.properties?.className)?.includes('language-mermaid');
}

export const rehypeMermaid: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, 'element', (node, index, parent) => {
            if (!isMermaid(node)) return;
            
            const codeElement = node.children[0] as Element;
            const codeText = codeElement.children
                .filter((n): n is Text => n.type === 'text')
                .map((n) => n.value)
                .join('');

            parent!.children[index!] = h('div', { className: ['mermaid'], codeData: codeText });
        });
    }
}
