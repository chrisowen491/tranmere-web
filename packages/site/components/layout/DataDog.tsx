// Necessary if using App Router to ensure this file runs on the client
"use client";

import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
  applicationId: "bb11809d-d51b-408d-9be4-cacc89c65d63",
  clientToken: "pub91e87345f76af7acb5aa202805d95df0",
  site: "datadoghq.eu",
  service: "www.tranmere-web.com",
  env: "prod",
  version: "1.0.0",
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input",
  // Specify URLs to propagate trace headers for connection between RUM and backend trace
  allowedTracingUrls: [
    {
      match: "https://www.tranmere-web.com/api/",
      propagatorTypes: ["tracecontext"],
    },
    {
      match: "https://www.tranmere-web.com/graphql/",
      propagatorTypes: ["tracecontext"],
    },
  ],
});

export default function DatadogInit() {
  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}
