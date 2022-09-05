import elasticlunr from 'elasticlunr'
import type { APIRoute } from 'astro'
import type { Props as Page } from '../layouts/Page.astro'

export const get: APIRoute = () => {
  const index = elasticlunr(function () {
    this.addField('title')
    this.addField('description')
    this.addField('id')
  })

  const allPages = import.meta.glob<Page>('./**/*.mdx', { eager: true })

  for (const { frontmatter, url } of Object.values(allPages)) {
    index.addDoc({
      id: url,
      title: frontmatter.title,
      description: frontmatter.description,
      // content: TODO
    })
  }

  return {
    body: JSON.stringify(index.toJSON()),
  }
}
