export default function PortalCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

      {title && (
        <div className="border-b px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {title}
          </h3>
        </div>
      )}

      <div className="p-5">{children}</div>

    </div>
  );
}