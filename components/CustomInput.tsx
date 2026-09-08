import {
    Control,
    Controller,
    FieldPath,
} from "react-hook-form";
import { z } from "zod";

import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

import { authFormSchema } from "@/lib/utils";

const formSchema = authFormSchema("sign-up");

interface CustomInputProps {
    control: Control<z.infer<typeof formSchema>>;
    name: FieldPath<z.infer<typeof formSchema>>;
    label: string;
    placeholder: string;
    type?: string;
}

const CustomInput = ({
    control,
    name,
    label,
    placeholder,
    type = "text"
}: CustomInputProps) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                        htmlFor={field.name}
                        className="text-14 w-full max-w-70 font-medium text-gray-700"
                    >
                        {label}
                    </FieldLabel>

                    <div className="flex w-full flex-col">
                        <Input
                            {...field}
                            id={field.name}
                            placeholder={placeholder}
                            className="text-16 placeholder:text-16 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500"
                            type={type}
                            aria-invalid={fieldState.invalid}
                        />

                        {fieldState.invalid && (
                            <FieldError
                                errors={[fieldState.error]}
                                className="text-12 text-red-500 mt-2"
                            />
                        )}
                    </div>
                </Field>
            )}
        />
    );
};

export default CustomInput;