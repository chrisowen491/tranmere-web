import { LastMatch } from "@/components/fragments/LastMatch";
import { RecentArticles } from "@/components/fragments/RecentArticles";

export async function SideBar() {
  return (
    <aside className="col-md-4 content-aside bg-light">
      <RecentArticles count={3}></RecentArticles>
    </aside>
  );
}
