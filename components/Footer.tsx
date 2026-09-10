"use client"

import { CircleUserRound, Loader2 } from 'lucide-react'
import { toast } from './ui/toast';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useState } from 'react';
import Link from 'next/link';

const Footer = ({ user }: { user: User }) => {

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/logout", {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.add({
          title: result.message,
          type: "success",
        });
        router.push("/sign-in")
      }
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Something went wrong",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <footer>
      {user ? (
        <>
          <div className="flex flex-row items-center gap-3 mb-4 px-4 py-4">
            <CircleUserRound size={28} className="text-gray-700" />
            <div>
              <h1 className="text-12 font-semibold text-gray-700">{user?.firstName} {user?.lastName}</h1>
              <h1 className="text-gray-600 text-12">{user?.email}</h1>
            </div>
          </div>
          <Button variant="destructive" disabled={isLoading} type="submit" className="w-full mb-10 cursor-pointer" onClick={handleLogout}>
            {isLoading ? (
              <>
                <Loader2
                  size={20}
                  className="mr-2 animate-spin"
                />
                Please Wait...
              </>
            ) : (
              "Logout"
            )}
          </Button>
        </>
      ) : (
        <Link href={"sign-in"}>
          <Button variant="destructive" className="w-full mb-10">Sign-In</Button>
        </Link>
      )
      }

    </footer >
  )
}

export default Footer
