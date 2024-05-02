import { ProfileBuilder } from './lib/tranmere-web-profile-builder';

const profileBuilderInstance = new ProfileBuilder();

(async function main() {
  await profileBuilderInstance.buildProfiles();
})();
