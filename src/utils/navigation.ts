import type { MDXInstance } from 'astro'
import { DepGraph } from 'dependency-graph'
import type { SEO } from '../data/seo.js'

export interface Page extends Partial<SEO> {
  navigation?: {
    order: number
    title?: string
  }
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

export function findNavigationEntries(nodes: MDXInstance<Page>[] = [], key = '') {
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

function getDependencyGraph(nodes: MDXInstance<Page>[] = []) {
  let pages = findNavigationEntries(nodes)
  let graph = new DepGraph<Entry>()
  findDependencies(pages, graph)
  return graph
}

export function findBreadcrumbEntries(
  nodes: MDXInstance<Page>[],
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

export function findHeadingEntries(
  node: MDXInstance<Page>,
  options: { levels: number[] } = { levels: [2]}
): Entry[] {
  return node.getHeadings()
    .filter((heading) => options.levels.includes(heading.depth))
    .map((heading, i) => ({
      title: heading.text,
      url: `${node.url}#${heading.slug}`,
      order: i,
    }))
}