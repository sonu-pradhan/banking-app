"use client";

import { Loader2, Star } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

const SetPrimaryButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Setting...
        </>
      ) : (
        <>
          <Star className="size-4" />
          Set as primary
        </>
      )}
    </Button>
  );
};

export default SetPrimaryButton;