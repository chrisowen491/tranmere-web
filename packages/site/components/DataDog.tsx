"use client";

import { datadogLogs } from "@datadog/browser-logs";
import { useEffect } from "react";

export default function InitDataDog() {
  useEffect(() => {
    const initDD = () => {
      datadogLogs.init({
        clientToken: "pub91e87345f76af7acb5aa202805d95df0",
        env: 'prod',
        site: 'datadoghq.eu',
        forwardConsoleLogs: ["error", "info"],
        sessionSampleRate: 100,
        service: "www.tranmere-web.com",
      });
    };
    initDD();
  }, []);
  return <></>;
}

/*
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
*/
  