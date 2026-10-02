import { PlaygroundNav } from "../../components/playground-nav";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-14">
      <PlaygroundNav />
      {children}
    </div>
  );
}
