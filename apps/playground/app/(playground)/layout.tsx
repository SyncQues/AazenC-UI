import { PlaygroundNav } from "../../components/playground-nav";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <PlaygroundNav />
      {children}
    </div>
  );
}
