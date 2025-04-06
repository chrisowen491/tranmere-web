import { Deployments } from '@tranmere-web/lib/src/cloudflare';

interface Env {
  CLOUDFLARE_AUTH_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
}

export default {
  async fetch(env: Env) {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/tranmere-web/deployments`;
    const expirationDays = 7;

    const init = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${env.CLOUDFLARE_AUTH_KEY}`
      }
    };

    const response = await fetch(endpoint, init);

    console.log(response.status);

    const deployments = (await response.json()) as Deployments;

    console.log(`${deployments.result.length} deployments found to delete.`);

    for (const deployment of deployments.result) {
      // Check if the deployment was created within the last x days (as defined by `expirationDays` above)
      const created = new Date(deployment.created_on);
      if ((Date.now() - created.getTime()) / 86400000 > expirationDays) {
        // Delete the deployment
        await fetch(`${endpoint}/${deployment.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: `Bearer ${env.CLOUDFLARE_AUTH_KEY}`
          }
        });
      }
    }

    return new Response('ok', {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });
  },

  async scheduled(request: Request, env: Env) {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/tranmere-web/deployments`;
    const expirationDays = 7;

    const init = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${env.CLOUDFLARE_AUTH_KEY}`
      }
    };

    const response = await fetch(endpoint, init);

    console.log(response.status);

    const deployments = (await response.json()) as Deployments;

    console.log(`${deployments.result.length} deployments found to delete.`);

    for (const deployment of deployments.result) {
      // Check if the deployment was created within the last x days (as defined by `expirationDays` above)
      const created = new Date(deployment.created_on);
      if ((Date.now() - created.getTime()) / 86400000 > expirationDays) {
        // Delete the deployment
        await fetch(`${endpoint}/${deployment.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: `Bearer ${env.CLOUDFLARE_AUTH_KEY}`
          }
        });
      }
    }

    return new Response('ok', {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });
  }
};
