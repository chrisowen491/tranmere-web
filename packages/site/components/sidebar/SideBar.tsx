import { LastMatch } from "./LastMatch";
import { RecentArticles } from "./RecentArticles";

export async function SideBar() {

  return (
    <aside className="col-md-4 content-aside bg-light">
        <LastMatch></LastMatch>
        <RecentArticles count={3}></RecentArticles>
    </aside>
  );
}
