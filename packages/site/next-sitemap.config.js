/** @type {import('next-sitemap').IConfig} */

module.exports = {
    siteUrl: 'https://www.tranmere-web.com',
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    generateRobotsTxt: true,
    exclude: ['/dynamic-sitemap.xml'],
    //alternateRefs: [
    //  {
    //    href: 'https://es.example.com',
    //    hreflang: 'es',
    //  },
    //  {
    //    href: 'https://fr.example.com',
    //    hreflang: 'fr',
    //  },
    //],
    // Default transformation function
    transform: async (config, path) => {
      return {
        loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        alternateRefs: config.alternateRefs ?? [],
      }
    },
    //additionalPaths: async (config) => [
    //  await config.transform(config, '/additional-page'),
    //],
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/*?*', 
            '/404',
            '/error',
            '/edit*',
            '/match/192*',
            '/match/193*',
            '/match/194*',
            '/match/195*',
            '/match/196*',
            '/match/1970*',
            '/match/1971*',
            '/match/1972*',
            '/match/1973*',
            '/match/1974*',
            '/match/1975*',
            '/match/1976*'
        ],
        }
      ],
      additionalSitemaps: [
        'https://www.tranmere-web.com/dynamic-sitemap.xml',
      ],
    },
  }