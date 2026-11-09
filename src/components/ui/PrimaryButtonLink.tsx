import Link from "next/link";

interface PrimaryButtonLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function PrimaryButtonLink({ href, children, onClick }: PrimaryButtonLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full bg-primary text-white px-5 py-3 rounded-xl hover:bg-primary-dark transition font-medium inline-block text-center"
    >
      {children}
    </Link>
  );
}
