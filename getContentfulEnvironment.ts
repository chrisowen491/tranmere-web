import { strict as assert } from 'assert';
import { createClient } from 'contentful-management';
import { EnvironmentGetter } from 'contentful-typescript-codegen';

const { CF_MANANGEMENT_KEY, CF_SPACE } = process.env;

assert(CF_MANANGEMENT_KEY);
assert(CF_SPACE);

export const getContentfulEnvironment: EnvironmentGetter = () => {
  const contentfulClient = createClient({
    accessToken: CF_MANANGEMENT_KEY
  });

  return contentfulClient
    .getSpace(CF_SPACE)
    .then((space) => space.getEnvironment('master'));
};
