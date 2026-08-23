import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";

export default function BidNoticeGone() {
  const { locale } = useRouter();
  const isEnglish = locale === "en";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          410
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">
          {isEnglish
            ? "Bid notices are no longer available."
            : "입찰공고 서비스를 종료했습니다."}
        </h1>
        <p className="mt-4 text-slate-600">
          {isEnglish
            ? "The requested bid notice has been permanently removed."
            : "요청하신 입찰공고 경로는 더 이상 공개하지 않습니다."}
        </p>
      </section>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.statusCode = 410;
  return { props: {} };
};
