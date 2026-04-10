import { redirect } from "next/navigation";

type HomeRedirectPageProps = {
  searchParams?: {
    section?: string;
  };
};

export default function HomeRedirectPage({ searchParams }: HomeRedirectPageProps) {
  const params = new URLSearchParams();

  if (searchParams?.section) {
    params.set("section", searchParams.section);
  }

  redirect(params.size ? `/account?${params.toString()}` : "/account");
}
