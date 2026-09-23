"use client";

interface ConfirmSubmitButtonProps {
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
}

export default function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
