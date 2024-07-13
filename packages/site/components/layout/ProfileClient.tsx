'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function ProfileClient() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div className="text-gray-50">Loading...</div>;
  if (error) return <div className="text-gray-50">{error.message}</div>;

  return (
    <>
    {user ? (
          <a href="/api/auth/logout"><img src={user.picture!} alt={user.name!} className=" rounded-full h-6 w-6 mx-1 fill-slate-50 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" /></a>
    ) : (
      <a href="/api/auth/login" className='text-gray-50  mx-4'>Login</a>
    )}
    </>
  );
}