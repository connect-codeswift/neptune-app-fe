"use client";

export type CapaModalFieldLabelProps = Readonly<{
  children: string;
  required?: boolean;
  htmlFor?: string;
}>;

export function CapaModalFieldLabel(props: CapaModalFieldLabelProps) {
  const { children, required = false, htmlFor } = props;

  return (
    <label
      htmlFor={htmlFor}
      className="text-ehs-gray block text-sm leading-[19.5px]"
    >
      {children}
      {required ? <span className="text-ehs-red"> *</span> : null}
    </label>
  );
}
