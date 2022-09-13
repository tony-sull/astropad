import type { MarkdownInstance, MDXInstance } from 'astro'
import { DepGraph } from 'dependency-graph'
import type { SEO } from '../data/seo.js'
import type { RequireSome } from './types.js'

export interface PageFrontmatter extends RequireSome<SEO, 'title'> {
  navigation?: {
    order: number
    title?: string
  }
}

export type Page = MarkdownInstance<PageFrontmatter> | MDXInstance<PageFrontmatter>

export function isMDXPage(page: Page): page is MDXInstance<PageFrontmatter> {
  return 'getHeadings' in page
}

export interface Entry {
  title: string
  url: string
  order: number
  parentKey?: string
  children?: Entry[]
}

function getParentKey(url: string) {
  const segments = url.split('/')

  if (segments.length === 1) return undefined
  return segments.slice(0, segments.length - 1).join('/')
}

export function findNavigationEntries(nodes: Page[] = [], key = '') {
  let pages: Entry[] = []

  for (const entry of nodes) {
    if (entry.frontmatter.navigation) {
      const nav = entry.frontmatter.navigation
      const parent = getParentKey(entry.url!)
      if ((!key && !parent) || parent === key) {
        pages.push({
          ...nav,
          title: nav.title || entry.frontmatter.title,
          url: entry.url!,
        })
      }
    }
  }

  return pages
    .sort((a, b) => a.order - b.order)
    .map((entry) => {
      if (entry.url) {
        entry.children = findNavigationEntries(nodes, entry.url)
      }

      return entry
    })
}

function findDependencies(pages: Entry[], depGraph: DepGraph<Entry>, parentKey?: string) {
  for (let page of pages) {
    depGraph.addNode(page.url, page)
    if (parentKey) {
      depGraph.addDependency(page.url, parentKey)
    }
    if (page.children) {
      findDependencies(page.children, depGraph, page.url)
    }
  }
}

function getDependencyGraph(nodes: Page[] = []) {
  let pages = findNavigationEntries(nodes)
  let graph = new DepGraph<Entry>()
  findDependencies(pages, graph)
  return graph
}

export function findBreadcrumbEntries(
  nodes: Page[],
  activeKey: string,
  options: { includeSelf: boolean } = { includeSelf: true }
) {
  let graph = getDependencyGraph(nodes)
  if (!graph.hasNode(activeKey)) {
    // Fail gracefully if the key isn't in the graph
    return []
  }
  let deps = graph.dependenciesOf(activeKey)
  if (options.includeSelf) {
    deps.push(activeKey)
  }

  return activeKey
    ? deps.map((key) => {
        let data = Object.assign({}, graph.getNodeData(key))
        delete data.children
        return data
      })
    : []
}

export function findHeadingEntries(node: Page, options: { levels: number[] } = { levels: [2] }): Entry[] {
  return node
    .getHeadings()
    .filter((heading) => options.levels.includes(heading.depth))
    .map((heading, i) => ({
      title: heading.text,
      url: `${node.url}#${heading.slug}`,
      order: i,
    }))
}

function flatten(entries: Entry[]): Entry[] {
  let result: Entry[] = []

  function walk(entry: Entry) {
    result.push(entry)

    if (entry.children?.length) {
      entry.children.forEach(walk)
    }
  }

  for (const entry of entries) {
    walk(entry)
  }

  return result
}

export function findPaginationEntries(nodes: Page[], activeNode: Page): { next?: Entry; previous?: Entry } {
  const allEntries = flatten(findNavigationEntries(nodes))

  const index = allEntries.findIndex((entry) => entry.url === activeNode.url)

  const next = index >= 0 && index < allEntries.length - 1 ? allEntries[index + 1] : undefined
  const previous = index > 0 ? allEntries[index - 1] : undefined

  return { next, previous }
}
