import * as React from "react";
import { Stack, Text, Input, type InputProps } from "@chakra-ui/react";
import { type FieldError } from "react-hook-form";

export interface TextFieldProps extends InputProps {
  label: React.ReactNode;
  error?: FieldError | { message?: string };
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <Stack gap={1.5} width="100%">
        {React.isValidElement(label) || typeof label !== "string" ? (
          label
        ) : (
          <Text fontSize="sm" fontWeight="medium">
            {label}
          </Text>
        )}
        <Input ref={ref} {...props} />
        {error && (
          <Text color="red.500" fontSize="xs">
            {error.message}
          </Text>
        )}
      </Stack>
    );
  }
);

TextField.displayName = "TextField";
