import {
  Controller
} from 'react-hook-form';

import { ErrorMessage } from './ErrorMessage';

import type { ReactElement, ReactNode } from 'react';
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
  RegisterOptions
} from 'react-hook-form';


interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
  render: (field: ControllerRenderProps<T>) => ReactElement;
  error?: string;
  rules?: RegisterOptions<T>;
}

export const FormField = <T extends FieldValues>({
  name,
  control,
  label,
  render,
  error,
  rules
}: FormFieldProps<T>) => {
  return (
    <div className="relative flex flex-col gap-2">
      {label && (
        <label
          htmlFor={typeof label === 'string' ? label : undefined}
          className="cursor-pointer text-body2 web:text-heading3"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => render(field)}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
};