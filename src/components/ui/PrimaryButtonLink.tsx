import Link from "next/link";

interface PrimaryButtonLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function PrimaryButtonLink({ href, children }: PrimaryButtonLinkProps) {
  return (
    <Link
      href={href}
      className="w-full bg-primary text-white px-5 py-3 rounded-xl hover:bg-primary-dark transition font-medium inline-block text-center"
    >
      {children}
    </Link>
  );
}
