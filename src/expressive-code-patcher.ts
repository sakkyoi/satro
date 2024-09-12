/**
 * This is a expressive-code plugin for expressive code to exclude from tailwindcss typography.
 */
import { definePlugin } from '@expressive-code/core';

export const expressiveCodePatcher = () => {
  return definePlugin({
    // The only required property is `name`
    name: 'expressive-code-patcher',
    // Add more properties of `ExpressiveCodePlugin` to make your plugin
    // actually do something (e.g. `baseStyles`, `hooks`, etc.)
    hooks: {
        postprocessRenderedBlock: (context) => {
            (<Array<string>>context.renderData.blockAst.properties.className)?.push('not-prose');
        }
    },
  })
}
