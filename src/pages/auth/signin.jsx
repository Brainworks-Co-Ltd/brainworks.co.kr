export { default } from "@/pages/admin/auth/sign-in";

export function getServerSideProps() {
  return { redirect: { destination: "/admin/auth/sign-in", permanent: false } };
}
