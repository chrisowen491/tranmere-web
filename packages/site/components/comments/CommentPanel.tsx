"use client";
import type { Comment } from "@/lib/comments";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";
import StarIcon from "@heroicons/react/20/solid/StarIcon";

export default function CommentPanel(props: {
  comments: Comment[];
  url: string;
  className?: string;
}) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(3);

  const { user } = useUser();
  const [thecomments, setComments] = useState(props.comments);

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const onSubmit = async (formData: FormData) => {
    setRating(parseInt(formData.get("rating") as string));
    setText(formData.get("comment") as string);

    try {
      const data = await fetch("/api/comment", {
        method: "POST",
        body: JSON.stringify({
          text: formData.get("comment") as string,
          rating: formData.get("rating") as string,
          url: props.url,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setText("");
      setRating(3);

      setComments((await data.json()) as Comment[]);
    } catch (err) {
      console.log(err);
    }
  };

  const onDelete = async (comment: Comment) => {
    try {
      const data = await fetch("/api/comment", {
        method: "DELETE",
        body: JSON.stringify({ comment }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setComments((await data.json()) as Comment[]);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className={`mt-5 dark:text-gray-50 text-gray-900 ${props.className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <div className="col-span-full">
          <label
            htmlFor="comment"
            className="block text-sm font-medium leading-6"
          >
            Comment
          </label>
          <div className="mt-2">
            <textarea
              className="block w-full rounded-md border-0 py-1.5shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              rows={2}
              id="comment"
              name="comment"
              placeholder={
                user
                  ? `What are your thoughts?`
                  : "Please login to leave a comment"
              }
              onChange={(e) => setText(e.target.value)}
              value={text}
              disabled={!user}
            />
          </div>
        </div>
        <div className="col-span-full mt-4">
          <label
            htmlFor="rating"
            className="block text-sm font-medium leading-6"
          >
            Rating
          </label>
          <div className="mt-2">
            <select
              name="rating"
              defaultValue={rating}
              id="rating"
              className="block w-full rounded-md border-0 py-1.5shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option value={1}>1 - Could Do Better</option>
              <option value={2}>2 - Meh</option>
              <option value={3}>3 - Ok</option>
              <option value={4}>4 - Great</option>
              <option value={5}>5 - Legend</option>
            </select>
          </div>
        </div>

        <div className="flex items-center mt-4">
          {user ? (
            <div className="flex items-center space-x-6">
              <button className="py-2 px-4 rounded bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700">
                Send
              </button>
              <button
                className="text-gray-500"
                onClick={() => (window.location.href = "/api/auth/logout")}
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="py-2 px-4 rounded bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700"
              onClick={() => (window.location.href = "/api/auth/login")}
            >
              Log In
            </button>
          )}
        </div>
      </form>
      <div className="space-y-6 mt-10">
        {thecomments &&
          thecomments.map((comment, idx) => {
            const isAuthor = user && user.sub === comment.user.sub;
            const isAdmin =
              user && user.email === process.env.NEXT_PUBLIC_AUTH0_ADMIN_EMAIL;

            return (
              <>
                <div key={idx} className="flex space-x-4 text-sm">
                  <div className="flex-none py-10">
                    <img
                      alt="User avatar"
                      src={comment.user.picture}
                      className="h-10 w-10 rounded-full bg-gray-100"
                    />
                  </div>
                  <div
                    className={classNames(
                      idx === 0 ? "" : "border-t border-gray-200",
                      "flex-1 py-10",
                    )}
                  >
                    <h3 className="font-medium">{comment.user.name}</h3>
                    <p>
                      <time dateTime={comment.created_at.toString()}>
                        {comment.created_at}
                      </time>
                    </p>

                    <div className="mt-4 flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          aria-hidden="true"
                          className={classNames(
                            comment.rating > rating
                              ? "text-yellow-400"
                              : "text-gray-300",
                            "h-5 w-5 flex-shrink-0",
                          )}
                        />
                      ))}
                    </div>
                    <p className="sr-only">{comment.rating} out of 5 stars</p>

                    <div
                      dangerouslySetInnerHTML={{ __html: comment.text }}
                      className="prose prose-sm mt-4 max-w-none dark:text-gray-50"
                    />
                    {(isAdmin || isAuthor) && (
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => onDelete(comment)}
                        aria-label="Close"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          })}
      </div>
    </div>
  );
}
