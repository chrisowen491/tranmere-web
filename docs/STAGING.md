# Staging deployments

Pull requests from branches in this repository build the site and deploy it to
the shared `tranmere-web-staging` Cloudflare Worker. Pull requests from forks
still run the build, but skip deployment because repository secrets are not
available.

The staging Worker uses separate automatically provisioned D1 and R2 resources.
Production continues to use the top-level settings in `packages/site/wrangler.jsonc`.
