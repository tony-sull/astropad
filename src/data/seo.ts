import social from '../assets/social.png'

export interface Twitter {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player'
    site?: string
    creator?: string
}

export interface SEO {
    title: string
    description: string
    image: URL
    canonicalURL: URL
    twitter?: Twitter
    noindex?: boolean
    nofollow?: boolean
}

const seo: SEO = {
    title: 'Astropad',
    description: 'Create a modern notebook to document or explain almost anything.',
    image: new URL(social.src, 'https://pad.astro.build/'),
    canonicalURL: new URL('https://pad.astro.build')
}

export default seo
