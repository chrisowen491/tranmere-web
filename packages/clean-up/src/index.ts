import type { DeploymentState } from '@octokit/graphql-schema';
import type { RequestInit } from 'undici';
import { Deployments } from '@tranmere-web/lib/src/cloudflare';
import { env } from 'process';

import { debug, getInput, info, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { fetch } from 'undici';

(async () => {
  const apiToken = getInput('apiToken', { required: true });
  const accountId = getInput('accountId', { required: true });
  const projectName = getInput('projectName', { required: true });
  const githubToken = getInput('gitHubToken', { required: true });
  const githubBranch =
    env.GITHUB_HEAD_REF ?? env.GITHUB_REF_NAME ?? context.ref;

  info(`GitHub Event Name: ${context.eventName}`);

  const octokit = getOctokit(githubToken);
  const deployments = await octokit.graphql<{
    repository: {
      deployments: {
        edges: {
          node: {
            id: string;
            state: DeploymentState;
            commit: { oid: string };
            ref: { name: string } | null;
            statuses: {
              edges: {
                node: { environmentUrl: string | null; logUrl: string | null };
              }[];
            };
          };
        }[];
      };
    };
  }>(
    `
query ($owner: String!, $repo: String!, $env: String!) {
  repository(owner: $owner, name: $repo) {
    deployments(environments: [$env], first: 100) {
      edges {
        node {
          id
          state
          commit {
            oid
          }
          ref {
            name
          }
          statuses(first: 1) {
            edges {
              node {
                environmentUrl
                logUrl
              }
            }
          }
        }
      }
    }
  }
}
`,
    {
      owner: context.repo.owner,
      repo: context.repo.repo,
      env: `pr`
    }
  );

  const githubDeployments = deployments.repository.deployments.edges
    .filter(({ node }) => node.state !== 'ABANDONED')
    .filter(({ node }) => node.statuses.edges.length)
    .filter(({ node }) => node.statuses.edges[0].node.environmentUrl !== null)
    .filter(
      ({ node }) =>
        (node.ref?.name === githubBranch && node.commit.oid !== context.sha) ||
        node.ref === null
    );
  const deploymentUrls = githubDeployments.map(
    ({ node }) => node.statuses.edges[0].node.environmentUrl
  );
  if (!deploymentUrls.length) return info('No deployments found');
  debug(`Found deployments: ${deploymentUrls.join(', ')}`);

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`;
  const headers: RequestInit = {
    headers: { Authorization: `Bearer ${apiToken}` }
  };

  const deploymentsResponse = await fetch(`${endpoint}?per-page=50`, headers)
    .then((res) => {
      debug(`Cloudflare API response: ${res.status} ${res.statusText}`);
      return res.status === 200 ? res.json() : null;
    })
    .then((data) => (data ? (data as Deployments) : null));
  if (!deploymentsResponse) return setFailed('Failed to fetch deployments');

  const cfDeployments = deploymentsResponse.result
    .filter((d) => !d.is_skipped)
    .filter((d) => deploymentUrls.includes(d.url));
  if (!cfDeployments.length) return info('No deployments to delete');
  debug(
    `Found Cloudflare deployments: ${cfDeployments.map((d) => d.url).join(', ')}`
  );

  for await (const d of cfDeployments) {
    info(`Deleting deployment ${d.url}`);
    const res = await fetch(`${endpoint}/${d.id}?force=true`, {
      ...headers,
      method: 'DELETE'
    });
    info(`Got ${res.status} from cloudflare from ${endpoint}/${d.id}`);
    if (res.status === 200) {
      const deployment = githubDeployments.find(
        ({ node }) => node.statuses.edges[0].node.environmentUrl === d.url
      )?.node.id;
      if (deployment) {
        await octokit.graphql(
          `
mutation ($id: ID!) {
  createDeploymentStatus(
    input: { deploymentId: $id, environmentUrl: "", logUrl: "", state: INACTIVE }
  ) {
    clientMutationId
  }
}
`,
          {
            id: deployment,
            headers: { accept: 'application/vnd.github.flash-preview+json' }
          }
        );
      }
    }
  }

  await Promise.allSettled(
    cfDeployments.map((d) =>
      fetch(`${endpoint}/${d.id}`, { ...headers, method: 'DELETE' })
    )
  );
})().catch((err: Error) => {
  setFailed(err.message);
});
