export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-black/8" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs text-black/30 font-medium">or continue with email</span>
      </div>
    </div>
  );
}
