import { existsSync, statSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

export interface DtsExtensionPaths {
  /** Absolute `src` directory of the package being built. */
  inputDir: string
  /** Absolute `dist` directory of the package being built. */
  outDir: string
}

const sourceExtensions = ['.ts', '.tsx']

// `from '…'`, `import '…'` and `import('…')`; the specifier is group 3.
const specifierRE = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"\n]+)\2/g
const relativeRE = /^\.{1,2}(?:\/|$)/
// tsc prints inferred types through `baseUrl`, yielding specifiers such as
// 'packages/util/dist/type' that only exist inside this monorepo.
const baseUrlLeakRE = /^packages\/([^/]+\/dist\/.+)$/

function isFile(path: string) {
  return existsSync(path) && statSync(path).isFile()
}

/**
 * Suffix that turns the extensionless module path `base` (pointing into a
 * `src` tree) into the `.js` file it is emitted as, or `undefined` when no
 * source module lives there.
 */
function resolveJsSuffix(base: string) {
  if (sourceExtensions.some(ext => isFile(base + ext)))
    return '.js'
  if (sourceExtensions.some(ext => isFile(resolve(base, `index${ext}`))))
    return '/index.js'
}

function withJsExtension(specifier: string, base: string) {
  const trimmed = specifier.replace(/\/$/, '')
  const suffix = resolveJsSuffix(base)
  if (suffix)
    return trimmed + suffix
  // `allowImportingTsExtensions` lets sources write './foo.ts'; the emitted
  // module is still './foo.js'.
  if (/\.tsx?$/.test(trimmed) && !trimmed.endsWith('.d.ts') && isFile(base))
    return trimmed.replace(/\.tsx?$/, '.js')
  // An SFC's declaration is emitted as 'Foo.vue.d.ts', which node16/nodenext
  // only reach through 'Foo.vue.js'.
  if (trimmed.endsWith('.vue') && isFile(base))
    return `${trimmed}.js`
}

/**
 * Give every relative specifier in an emitted d.ts an explicit `.js`
 * extension. The packages are `"type": "module"`, so under
 * `moduleResolution: node16 | nodenext` TypeScript refuses extensionless
 * relative specifiers in their declarations and the exports silently vanish.
 *
 * Cross-package deep imports (`@v-c/util/dist/type`) are left alone: the
 * target's `exports` map already appends the extension.
 */
export function addDtsExtensions(filePath: string, content: string, paths: DtsExtensionPaths) {
  const sourceDir = resolve(paths.inputDir, relative(paths.outDir, dirname(filePath)))

  return content.replace(specifierRE, (match, prefix: string, quote: string, specifier: string) => {
    let resolved: string | undefined
    if (relativeRE.test(specifier)) {
      resolved = withJsExtension(specifier, resolve(sourceDir, specifier))
    }
    else {
      const leaked = specifier.match(baseUrlLeakRE)
      if (leaked)
        resolved = `@v-c/${leaked[1]}`
    }

    return resolved ? `${prefix}${quote}${resolved}${quote}` : match
  })
}
