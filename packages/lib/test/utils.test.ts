/// <reference types="@types/jest" />;
import { TranmereWebUtils } from '../src/tranmere-web-utils';

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