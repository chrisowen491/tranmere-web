import { TranmereWebUtils } from '../lib/tranmere-web-utils';
import { createClient } from 'contentful';
import { expect } from 'chai';

test('Can Get All Teams', async () => {
  const utils = new TranmereWebUtils();
  const teams = await utils.findAllTeams();
  expect(teams.length).to.above(1);
});

test('Can Get All Managers', async () => {
  const utils = new TranmereWebUtils();
  const managers = await utils.findAllTranmereManagers();
  expect(managers.length).to.above(1);
});

test('Can Get All Hat Tricks', async () => {
  const utils = new TranmereWebUtils();
  const hattricks = await utils.findAllHatTricks();
  expect(hattricks.length).to.above(1);
});

test('Can Get Pages From Contentful', async () => {
  const utils = new TranmereWebUtils();
  const client = createClient({
    space: process.env.CF_SPACE!,
    accessToken: process.env.CF_KEY!
  });

  const pages = await utils.getPages(client);
  expect(pages).to.be.not.null;
});
