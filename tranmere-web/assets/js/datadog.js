(function(h,o,u,n,d) {
h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
d=o.createElement(u);d.async=1;d.src=n
n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
})(window,document,'script','https://www.datadoghq-browser-agent.com/datadog-rum.js','DD_RUM')
DD_RUM.onReady(function() {
DD_RUM.init({
  clientToken: 'pub91e87345f76af7acb5aa202805d95df0',
  applicationId: 'bb11809d-d51b-408d-9be4-cacc89c65d63',
  site: 'datadoghq.eu',
  service:'tranmereweb',
  version: '1.0.0',
  sampleRate: 100,
  trackInteractions: true,
})
})