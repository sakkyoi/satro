/**
 * This is a rehype plugin for the headings to be scrollspy compatible with preline-ui.
 */
import type { Root, Element } from 'hast';
import { h } from 'hastscript';

export function scrollspyPatcher() {
    return (tree: Root) => {
        // this is the stack for the depth of the headings, the first element is the root level
        // this array will never have an element which is undefined, null or empty
        const dp: Array<Element> = [h("div", { depth: 0 })];
        let footnotes: Element | undefined;

        (<Array<Element>>tree.children).forEach(node => {
            if ((<Array<string>>node.properties?.className)?.includes("footnotes")) {
                footnotes = node;
                return; // skip the footnotes, will be handled later
            }

            // fall back all the levels to the nearest level and create a new level
            if (/^h[1-6]$/.test(node.tagName)) {
                const level = parseInt(node.tagName[1]); // extract the number of heading

                // find the nearest level which is smaller than the new level, 
                // and fall back all the levels which are larger than the new level
                // search from the end until the one with the smaller level
                for (let i = dp.length - 1; i >= 0; i--) {
                    if ((<number>dp[i].properties.depth) >= level) continue;

                    // fall back all the levels to the level which is smaller than the new level
                    for (let j = dp.length - 1; j > i; j--) {
                        dp[j - 1].children.push(dp.pop()!); // or push dp[j] and then dp.splice(j, 1)
                    }

                    break; // break the loop if we found the level
                }

                // create a new level
                const newGroup = h("div");
                newGroup.properties.id = node.properties.id; // use the id of the heading
                delete node.properties.id; // some plugin may add it back, i need to figure out in the future (there will be two same id in the html, but it is not a problem)

                newGroup.position = node.position; // copy the position of the heading (this is unnecessary but for debugging)
                newGroup.properties.depth = level; // set the depth of the new level

                ((<Array<string>>newGroup.properties.className) ||= []).push("article-section"); // this is for adding styles in global.css
                ((<Array<string>>node.properties.className) ||= []).push("group"); // this is for the anchor link hover effect inplemented in astro.config.mjs(rehypeAutolinkHeadings)

                dp.push(newGroup); // push the new level to the dp
            }

            dp[dp.length - 1].children.push(node); // push the node to the current level
        });
        
        // fall back all the levels to the root
        for (let i = dp.length - 1; i > 0; i--) {
            dp[i - 1].children.push(dp.pop()!); // or push dp[i] and then dp.splice(i, 1)
        }

        // add the footnotes to the end of the root level
        if (footnotes) {
            (<Element>footnotes.children[0]).tagName = "h1"; // change the tag of the footnotes to h1
            dp[0].children.push(footnotes);
        }

        tree.children = dp[0].children; // replace the children of the root with the children of the root level
    }
}
