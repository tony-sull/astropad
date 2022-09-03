export default function createIntegration() {
    /** @type {import('astro').AstroIntegration} */
    const integration = {
        name: 'astro-navigation',
        hooks: {
            'astro:build:setup': async () => {
                const allPages = import.meta.glob('./src/pages/**/*.mdx')
                console.log(allPages);
            }
        }
    }

    return integration
}