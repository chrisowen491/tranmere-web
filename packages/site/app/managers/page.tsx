export const runtime = "edge";
import { Title } from "@/components/fragments/Title";
import { GetAllTranmereManagers } from "@/lib/apiFunctions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tranmere Rovers Managerial Records",
  description: "Records of all Tranmere Rovers managers",
};

export default async function ManagerRecords() {
  const managers = await GetAllTranmereManagers();

  return (
    <>
      <Title
        subTitle={"Managers"}
        title="Manager Records"
        summary={"Complete first team manager records"}
      ></Title>
      <div className="py-2 sm:py-2">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ul
            role="list"
            className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
          >
            {managers.map((manager, idx) => (
              <li key={idx}>
                <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
                  {manager.name}
                </h3>
                <p>Joined: {manager.dateJoined}</p>
                <p>Left: {manager.dateLeftText}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
