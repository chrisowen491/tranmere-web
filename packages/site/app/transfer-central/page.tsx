import { Title } from "@/components/fragments/Title";
import { TransferSearch } from "@/components/apps/TransferSearch";
import { GetAllTeams } from "@tranmere-web/lib/src/apiFunctions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { Metadata } from "next";
import { GetBaseUrl } from "@/lib/apiFunctions";

export const metadata: Metadata = {
  title: "Transfers Home",
  description: "Tranmere Rovers transfer information index",
};

export default async function Transfers() {
  const base = GetBaseUrl((await getCloudflareContext({async: true})).env) + "/transfer-search/";

  const request = await fetch(base);
  const results = (await request.json()) as {
    transfers: Transfer[];
  };

  const teams = await GetAllTeams();

  return (
    <>
      <Title
        title="Transfers Home"
        subTitle="Players"
        summary="Browse transfers history and use filters to fine tune your search"
      ></Title>
      <TransferSearch default={results.transfers} teams={teams} />
    </>
  );
}
