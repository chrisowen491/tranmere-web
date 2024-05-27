const contentful = require("contentful");
const algoliasearch = require('algoliasearch');
const pack = require('../package.json');
const { SiteBuilder } = require("@tranmere-web/lib/build/tranmere-web-site-builder");
const siteBuilderInstance = new SiteBuilder();

const client = contentful.createClient({
  space: process.env.CF_SPACE,
  accessToken: process.env.CF_KEY
});
const search_client = algoliasearch(process.env.AL_SPACE, process.env.AL_KEY);
const search_index = search_client.initIndex(process.env.AL_INDEX);

class TranmereWebPlugin {
    
  constructor(options = {}) {
    this.options = { ...options };
  }
  
  apply(compiler) {

    const pluginName = 'Tranmere Web Plugin';
    const { webpack } = compiler;
    const { Compilation } = webpack;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,

          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async (assets) => {          
          compilation.fileDependencies.add("./package.json");
          await siteBuilderInstance.buildSite(client, pack.name, pack.version, compilation, this.options.index, search_index);
        }
      );
    });
  }
}  
module.exports = TranmereWebPlugin;