import pack from '../../../package.json';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

datadogRum.init({
  applicationId: 'bb11809d-d51b-408d-9be4-cacc89c65d63',
  clientToken: 'pub91e87345f76af7acb5aa202805d95df0',
  site: 'datadoghq.eu',
  service: 'www.tranmere-web.com',
  env: 'prod',
  version: pack.version,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100, // if not included, the default is 100
  trackResources: true,
  trackLongTasks: true,
  trackUserInteractions: true,
  defaultPrivacyLevel: 'mask-user-input',
  allowedTracingOrigins: [
    'https://www.tranmere-web.com',
    /https:\/\/.*\.tranmere-web\.com/
  ]
});
datadogLogs.init({
  clientToken: 'pub91e87345f76af7acb5aa202805d95df0',
  site: 'datadoghq.eu',
  service: 'www.tranmere-web.com',
  env: 'prod',
  version: pack.version,
  forwardErrorsToLogs: true,
  sessionSampleRate: 100
});
