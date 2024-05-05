import { TranmereWebUtils } from '../lib/tranmere-web-utils';
import { createClient } from 'contentful';

test('Can Get All Teams', async () => {
  const utils = new TranmereWebUtils();
  const teams = await utils.findAllTeams();
  expect(teams.length).toBeGreaterThan(1);
});

test('Can Get All Managers', async () => {
  const utils = new TranmereWebUtils();
  const managers = await utils.findAllTranmereManagers();
  expect(managers.length).toBeGreaterThan(1);
});

test('Can Get Pages From Contentful', async () => {
  const utils = new TranmereWebUtils();
  const client = createClient({
    space: process.env.CF_SPACE!,
    accessToken: process.env.CF_KEY!
  });

  const pages = await utils.getPages(client);
  expect(pages).toBeTruthy();
});
