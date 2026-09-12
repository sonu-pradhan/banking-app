"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CustomInput from "./CustomInput";
import { authFormSchema } from "@/lib/utils";
import { toast } from "./ui/toast";
import { useRouter } from "next/navigation";
import ConnectAccount from "./ConnectAccount";

const AuthFrom = ({ type }: { type: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      dateOfBirth: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {

      if (type === 'sign-up') {

        const userData = {
          firstName: data.firstName!,
          lastName: data.lastName!,
          address: data.address!,
          city: data.city!,
          state: data.state!,
          pinCode: data.pinCode!,
          dateOfBirth: data.dateOfBirth!,
          email: data.email,
          password: data.password
        }

        const response = await fetch("/api/sign-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
          toast.add({
            title: result.message,
            type: "success",
          });
          sessionStorage.setItem(
            "signupCredentials",
            JSON.stringify({
              email: data.email,
            })
          );
          router.push("/sign-in");
        } else {
          toast.add({
            title: result.message,
            type: "error",
          });
        }
      }


      if (type === "sign-in") {

        const userData = {
          email: data.email,
          password: data.password
        }

        const response = await fetch("api/sign-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();
        console.log(result)

        if (response.ok) {
          console.log(result)
          toast.add({
            title: result.message,
            type: "success",
          });

          if (result.user.primary_account_id) {
            router.push("/");
          } else {
            setUser(result.user);
          }
          
        } else {
          toast.add({
            title: result.message,
            type: "error",
          });
        }
      }


    } catch (error) {
      console.log(error);
      toast.add({
        title: "Something went wrong on server",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const credentials = sessionStorage.getItem("signupCredentials");

    if (credentials) {
      const { email } = JSON.parse(credentials);

      form.setValue("email", email);

      sessionStorage.removeItem("signupCredentials");
    }
  }, []);

  return (
    <section className="flex h-screen w-full overflow-hidden">
      <div className="flex h-full w-full items-center justify-center px-6 py-8 lg:w-1/2">
        <div className="w-full max-w-125">

          <header className="mb-8 flex flex-col gap-6">
            <Link
              href="/"
              className="flex cursor-pointer items-center gap-2"
            >
              <Image
                src="/logo.jpeg"
                width={34}
                height={34}
                alt="Ledge Meridian Logo"
                className="size-8"
              />

              <h1 className="font-ibm-plex-serif text-[26px] font-bold text-black">
                Ledge Meridian
              </h1>
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user && !user.primary_account_id
                  ? "Link Account"
                  : type === "sign-in"
                    ? "Sign In"
                    : "Sign Up"}
              </h1>

              <p className="mt-1 text-base text-gray-600">
                {user
                  ? "Link your account to get started"
                  : "Please enter your details"}
              </p>
            </div>
          </header>

          {user && !user.primary_account_id ? (
            <div>
              <ConnectAccount />
            </div>
          ) : (
            <>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {type === "sign-up" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <CustomInput
                        control={form.control}
                        name="firstName"
                        label="First Name"
                        placeholder="Enter your first name"
                      />

                      <CustomInput
                        control={form.control}
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter your last name"
                      />
                    </div>

                    <CustomInput
                      control={form.control}
                      name="address"
                      label="Address"
                      placeholder="Enter your address"
                    />

                    <CustomInput
                      control={form.control}
                      name="city"
                      label="City"
                      placeholder="Enter your city"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <CustomInput
                        control={form.control}
                        name="state"
                        label="State"
                        placeholder="Enter your state"
                      />

                      <CustomInput
                        control={form.control}
                        name="pinCode"
                        label="PIN Code"
                        placeholder="Enter your PIN Code"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <CustomInput
                        control={form.control}
                        name="dateOfBirth"
                        label="Date of Birth"
                        placeholder="DD-MM-YYYY"
                      />

                      <CustomInput
                        control={form.control}
                        name="email"
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                      />
                    </div>
                  </>
                )}

                {type === "sign-in" && (
                  <CustomInput
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                  />
                )}

                <CustomInput
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg border border-[#0179FE] bg-linear-to-r from-[#0179FE] to-[#4893FF] text-base font-semibold text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={20}
                        className="mr-2 animate-spin"
                      />
                      Please Wait...
                    </>
                  ) : type === "sign-in" ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>

              <footer className="mt-6 flex justify-center gap-1">
                <p className="text-sm text-gray-600">
                  {type === "sign-in"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </p>

                <Link
                  href={
                    type === "sign-in"
                      ? "/sign-up"
                      : "/sign-in"
                  }
                  className="text-sm font-medium text-[#0179FE]"
                >
                  {type === "sign-in"
                    ? "Sign Up"
                    : "Sign In"}
                </Link>
              </footer>
            </>
          )}
        </div>
      </div>

      <div className="relative hidden h-screen w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/40 to-blue-100/60" />

        <Image
          src="/logo.jpeg"
          alt=""
          width={400}
          height={400}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                   scale-125 blur-2xl opacity-60"
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 text-center">

          <div className="mb-12 rounded-full border border-blue-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
            <p className="text-sm font-medium text-[#0179FE]">
              Secure. Simple. Yours.
            </p>
          </div>

          <h2 className="max-w-lg mb-6 text-4xl font-bold tracking-wide text-zinc-700">
            Your money,
            <br />
            <span className="text-[#0179FE]">your way.</span>
          </h2>

          <p className="mt-5 max-w-md font-semibold leading-7 text-gray-600">
            Experience smarter banking with <span className="italic text-rose-700">Ledge Meridian</span>.
            Manage your accounts, track your finances, and stay
            in control of your money.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AuthFrom;