import { Deployments } from '@tranmere-web/lib/src/cloudflare';

const endpoint =
  'https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/deployments';
const expirationDays = 7;

interface Env {
  API_TOKEN: string;
}

export default {
  async scheduled(request: Request, env: Env) {
    const init = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${env.API_TOKEN}`
      }
    };

    const response = await fetch(endpoint, init);
    const deployments = (await response.json()) as Deployments;

    for (const deployment of deployments.result) {
      // Check if the deployment was created within the last x days (as defined by `expirationDays` above)
      const created = new Date(deployment.created_on);
      if ((Date.now() - created.getTime()) / 86400000 > expirationDays) {
        // Delete the deployment
        await fetch(`${endpoint}/${deployment.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: `Bearer ${env.API_TOKEN}`
          }
        });
      }
    }
  }
};
