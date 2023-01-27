const path = require('path')

class TemplateWatcherPlugin {
    
  constructor(options = {}) {
    this.options = { ...options };
  }
  
  apply(compiler) {
    compiler.hooks.afterCompile.tap("Custom watcher", (compilation) => {      
        [path.join(this.options.path, '/templates')].forEach((path) =>
          compilation.contextDependencies.add(path)
        );
        compilation.fileDependencies.add("./package.json"); 
    });
  }
}  
module.exports = TemplateWatcherPlugin;