type AdminFormFeedbackProps = {
  error?: string | null;
  message?: string | null;
};

export function AdminFormFeedback({
  error,
  message,
}: AdminFormFeedbackProps) {
  return (
    <>
      {message ? (
        <p
          role="status"
          className="rounded-[var(--bw-radius-control)] border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-[var(--bw-radius-control)] border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
