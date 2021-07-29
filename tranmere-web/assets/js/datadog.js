datadogRum.init({
    applicationId: 'bb11809d-d51b-408d-9be4-cacc89c65d63',
    clientToken: 'pub91e87345f76af7acb5aa202805d95df0',
    site: 'datadoghq.eu',
    service:'tranmereweb',
    // Specify a version number to identify the deployed version of your application in Datadog 
    version: '1.0.0',
    sampleRate: 100,
    trackInteractions: true,
    allowedTracingOrigins: ["https://www.tranmere-web.com"]
});