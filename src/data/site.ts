export interface Site {
  name: string
  footer: string
  githubUrl?: string
}

const site: Site = {
  name: 'Astropad',
  footer: 'Made with ❤ by Astro',
  githubUrl: 'https://github.com/tony-sull/astropad',
}

export default site
