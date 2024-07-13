export type User = {
    name: string;
    picture: string;
    sub: string;
    email?: string;
  };
  
  export type Comment = {
    id?: number;
    created_at: string;
    url: string;
    text: string;
    rating: number;
    user: User;
  };

  export interface DBComment {
    id: number;
    page_url: string;
    image_url: string;
    created: string;
    sub: string;
    user_name: string;
    email: string;
    rating: number;
    comment: string;
  }


export async function GetCommentsByUrl(env: CloudflareEnv, url: string): Promise<Comment[]> {

    const commentsQuery = await env.DB.prepare('SELECT * FROM Ratings WHERE page_url = ?').bind(url).all<DBComment>()

    const comments : Comment[] = commentsQuery.results.map(r => {
      return {
        id: r.id as number,
        created_at: r.created,
        url: r.page_url,
        text: r.comment,
        rating: r.rating,
        user: {
          name: r.user_name,
          picture: r.image_url,
          sub: r.sub,
          email: r.email
        }
      }
    })
    return comments;
}