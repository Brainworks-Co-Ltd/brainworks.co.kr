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
          className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
