interface Announcement {
  id: string;
  title: string;
  summary?: string;
  date?: string;
  imageUrl?: string;
}

interface Props {
  news: Announcement;
  variant?: "large" | "small";
}

export function NewsTileSquare({ news, variant = "small" }: Props) {
  const isLarge = variant === "large";

  return (
    <div
      className="
        relative overflow-hidden rounded-2xl shadow-md h-full
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:scale-[1.015]
        hover:ring-2 hover:ring-violet-500/60
        cursor-pointer
      "
    >
      {/* Background image or gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
        style={{
          backgroundImage: news.imageUrl
            ? `url(${news.imageUrl})`
            : "linear-gradient(135deg, #5b21b6, #7c3aed, #6d28d9)",
        }}
      />

      {/* Overlay — stronger at bottom for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

      {/* Category chip */}
      <div className="absolute top-3 left-3">
        <span className="rounded-full bg-violet-600/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
          Noticia
        </span>
      </div>

      {/* Text content */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 text-white ${isLarge ? "p-6" : "p-3"}`}>
        <h3 className={`font-semibold leading-tight ${isLarge ? "text-2xl" : "text-sm"}`}>
          {news.title}
        </h3>

        {news.summary && isLarge && (
          <p className="text-sm mt-2 text-white/85 line-clamp-2">{news.summary}</p>
        )}

        {news.date && (
          <span className={`block mt-2 text-white/60 ${isLarge ? "text-xs" : "text-[10px]"}`}>
            {new Date(news.date).toLocaleDateString("es-CO", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}