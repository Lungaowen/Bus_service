import logo from "./logo.jpeg";

export function TshwaneLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="City of Tshwane Logo" className="h-14 w-auto" />
    </div>
  );
}
