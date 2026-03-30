"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

type Leader = {
  id: string;
  name: string;
  role: string;
  image?: string | null;
  description?: string;
  linkedin?: string;
};

type LeadersSectionProps = {
  leaders: Leader[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LeaderAvatar({ leader }: { leader: Leader }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = leader.image && leader.image.trim() !== "" && !imgError;

  if (hasImage) {
    return (
      <Image
        src={leader.image!}
        alt={leader.name}
        width={96}
        height={96}
        onError={() => setImgError(true)}
        className="rounded-full object-cover ring-4 ring-slate-100 transition-all duration-300 group-hover:ring-violet-200 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl font-semibold ring-4 ring-violet-100 transition-all duration-300 group-hover:ring-violet-200 group-hover:scale-105 shadow-md shadow-violet-200">
      {getInitials(leader.name)}
    </div>
  );
}

export function LeadersSection({ leaders }: LeadersSectionProps) {
  return (
    <section className="space-y-10 py-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="h-px w-10 rounded-full bg-violet-200" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Conoce a nuestros líderes
          </h2>
          <span className="h-px w-10 rounded-full bg-violet-200" />
        </div>

        <p className="text-sm text-slate-400">
          Personas que impulsan nuestra visión, estrategia y crecimiento.
        </p>
      </div>

      {/* Grid + botón esquina inferior derecha */}
      <div className="relative">
        <div className="flex flex-wrap justify-center gap-6">
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg hover:border-violet-200 w-[calc(25%-18px)] min-w-[220px]"
            >
              <div className="flex flex-col items-center text-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <LeaderAvatar leader={leader} />
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-violet-500/0 blur-xl transition-all duration-300 group-hover:bg-violet-400/15" />
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {leader.name}
                  </h3>

                  <p className="text-sm font-medium text-violet-600">
                    {leader.role}
                  </p>

                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {leader.description}
                  </p>
                </div>

                {/* LinkedIn */}
                {leader.linkedin && (
                  <a
                    href={leader.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
                  >
                    Ver perfil →
                  </a>
                )}
              </div>

              {/* Animated bottom bar */}
              <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300 group-hover:w-full rounded-b-xl" />
            </motion.div>
          ))}
        </div>

        {/* Botón Ver directorio — esquina inferior derecha, pegado al grid */}
        <div className="flex justify-end mt-4">
          <Link
            href="/directory"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-700 transition-colors duration-200"
          >
            <span className="border-b border-slate-300 group-hover:border-violet-500 transition-colors duration-200">
              Ver directorio completo
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}