// app/(protected)/(intranet)/departments/administrative/rooms/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter }                         from "next/navigation";
import {
  ChevronLeft, Users, MapPin, Tv2, Projector,
  PenLine, CheckCircle2, ArrowRight, CalendarDays,
  Clock, AlertCircle, Wifi,
} from "lucide-react";
import {
  getRooms, getRoomAvailability, bookRoom,
  type Room, type RoomSlot, type RoomBookingPayload,
} from "@/lib/graph/departments/administrative.service";
import {
  FieldWrapper, Input, Textarea,
  SubmitButton, SuccessBanner,
} from "@/app/(protected)/(intranet)/departments/administrative-services/forms/FormPrimitives";

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Proyector":        <Projector size={12} />,
  "Videoconferencia": <Wifi      size={12} />,
  "TV":               <Tv2       size={12} />,
  "Pizarrón":        <PenLine   size={12} />,
};

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = ["Sala", "Fecha y hora", "Detalle", "Confirmado"];

function PageStepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        const isLast = i === STEPS.length - 1;
        return (
          <li key={i} className="flex items-center gap-0 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span className={`
                flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
                transition-all duration-300
                ${done    ? "bg-rose-700 text-white"
                : active  ? "bg-rose-100 text-rose-700 ring-2 ring-rose-300"
                :           "bg-slate-100 text-slate-400"
                }
              `}>
                {done ? "✓" : i + 1}
              </span>
              <span className={`text-[11px] font-medium whitespace-nowrap
                ${active ? "text-rose-700" : done ? "text-slate-600" : "text-slate-400"}
              `}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-px flex-1 mx-2 mb-4 transition-colors duration-300
                ${done ? "bg-rose-300" : "bg-slate-200"}`
              } />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Room Card ─────────────────────────────────────────────────────────────────

function RoomCard({
  room, selected, onSelect,
}: {
  room:     Room;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group relative flex flex-col gap-3 rounded-2xl border p-5 text-left
        transition-all duration-200
        ${selected
          ? "border-rose-300 bg-rose-50 shadow-md shadow-rose-100/60"
          : "border-slate-200 bg-white hover:border-rose-200 hover:shadow-sm"
        }
      `}
    >
      {selected && (
        <CheckCircle2 size={18} className="absolute right-4 top-4 text-rose-600" />
      )}
      <div>
        <p className={`font-bold text-sm ${selected ? "text-rose-800" : "text-slate-800"}`}>
          {room.name}
        </p>
        <p className="flex items-center gap-1 mt-0.5 text-[12px] text-slate-400">
          <MapPin size={11} /> {room.floor}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center justify-center h-6 w-6 rounded-lg
          ${selected ? "bg-rose-100" : "bg-slate-100"}`}>
          <Users size={12} className={selected ? "text-rose-600" : "text-slate-500"} />
        </span>
        <span className="text-xs text-slate-600 font-medium">
          Hasta {room.capacity} personas
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {room.amenities.map((a) => (
          <span
            key={a}
            className={`
              inline-flex items-center gap-1 rounded-full border px-2 py-0.5
              text-[10px] font-medium transition-colors
              ${selected
                ? "border-rose-200 bg-rose-100/60 text-rose-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
              }
            `}
          >
            {AMENITY_ICONS[a] ?? null} {a}
          </span>
        ))}
      </div>
    </button>
  );
}

// ── Slot Grid ─────────────────────────────────────────────────────────────────

function SlotGrid({
  slots, selectedStart, selectedEnd, onToggle,
}: {
  slots:         RoomSlot[];
  selectedStart: string;
  selectedEnd:   string;
  onToggle:      (slot: RoomSlot) => void;
}) {
  const isInRange = (slot: RoomSlot) => {
    if (!selectedStart) return false;
    const end = selectedEnd || selectedStart;
    return slot.start >= selectedStart && slot.start <= end;
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const inRange = isInRange(slot);
        const isStart = slot.start === selectedStart;
        return (
          <button
            key={slot.start}
            type="button"
            disabled={slot.taken}
            onClick={() => onToggle(slot)}
            {...(slot.taken && slot.takenBy ? { title: slot.takenBy } : {})}
            className={`
              flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5
              text-center transition-all duration-150
              ${slot.taken
                ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                : inRange
                  ? isStart
                    ? "border-rose-400 bg-rose-600 shadow-sm text-white"
                    : "border-rose-200 bg-rose-100 text-rose-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50"
              }
            `}
          >
            <Clock
              size={11}
              className={inRange ? (isStart ? "text-rose-100" : "text-rose-500") : "text-slate-400"}
            />
            <span className={`text-xs font-semibold ${slot.taken ? "text-slate-400" : ""}`}>
              {slot.start}
            </span>
            <span className={`text-[9px] ${slot.taken ? "text-slate-300" : inRange ? "" : "text-slate-400"}`}>
              {slot.taken ? "Ocupado" : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RoomBookingPage() {
  const router = useRouter();

  const [step,          setStep]          = useState(0);
  const [rooms,         setRooms]         = useState<Room[]>([]);
  const [roomsLoading,  setRoomsLoading]  = useState(true);
  const [selectedRoom,  setSelectedRoom]  = useState<Room | null>(null);
  const [selectedDate,  setSelectedDate]  = useState(todayISO());
  const [slots,         setSlots]         = useState<RoomSlot[]>([]);
  const [slotsLoading,  setSlotsLoading]  = useState(false);
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd,   setSelectedEnd]   = useState("");
  const [title,         setTitle]         = useState("");
  const [attendees,     setAttendees]     = useState("");
  const [notes,         setNotes]         = useState("");
  const [titleErr,      setTitleErr]      = useState("");
  const [timeErr,       setTimeErr]       = useState("");
  const [loading,       setLoading]       = useState(false);
  const [bookingId,     setBookingId]     = useState("");
  const [done,          setDone]          = useState(false);

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .finally(() => setRoomsLoading(false));
  }, []);

  const fetchSlots = useCallback(async (roomId: string, date: string) => {
    setSlotsLoading(true);
    setSelectedStart("");
    setSelectedEnd("");
    try {
      const s = await getRoomAvailability(roomId, date);
      setSlots(s);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoom && selectedDate) {
      fetchSlots(selectedRoom.id, selectedDate);
    }
  }, [selectedRoom, selectedDate, fetchSlots]);

  const handleSlotToggle = (slot: RoomSlot) => {
    if (!selectedStart) {
      setSelectedStart(slot.start);
      setSelectedEnd(slot.start);
      return;
    }
    if (slot.start < selectedStart) {
      setSelectedStart(slot.start);
      return;
    }
    if (slot.start === selectedStart) {
      setSelectedStart("");
      setSelectedEnd("");
      return;
    }
    const startIdx = slots.findIndex((s) => s.start === selectedStart);
    const endIdx   = slots.findIndex((s) => s.start === slot.start);
    const range    = slots.slice(startIdx, endIdx + 1);
    if (range.some((s) => s.taken)) {
      setTimeErr("El rango seleccionado incluye horarios ocupados.");
      return;
    }
    setTimeErr("");
    setSelectedEnd(slot.start);
  };

  const computedEndTime = (): string => {
    if (!selectedEnd) return "";
    const idx = slots.findIndex((s) => s.start === selectedEnd);
    // Fix: slots[idx].end puede ser undefined — fallback a ""
    return idx >= 0 ? (slots[idx]?.end ?? "") : "";
  };

  const handleBook = async () => {
    setTitleErr("");
    setTimeErr("");
    if (!title.trim())  { setTitleErr("El título es requerido"); return; }
    if (!selectedStart) { setTimeErr("Selecciona al menos un horario"); return; }

    // Fix: selectedRoom puede ser null — guard explícito antes del payload
    if (!selectedRoom) return;

    const payload: RoomBookingPayload = {
      roomId:         selectedRoom.id,
      date:           selectedDate,
      startTime:      selectedStart,
      endTime:        computedEndTime(),
      title,
      attendeesCount: attendees ? Number(attendees) : 1,
      // Fix: notes es opcional — spread condicional para no pasar undefined
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    setLoading(true);
    try {
      const res = await bookRoom(payload);
      setBookingId(res.bookingId);
      setDone(true);
      setStep(3);
    } catch {
      setTimeErr("Error al realizar la reserva. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 0 && !done ? setStep((s) => s - 1) : router.back())}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5
                text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={14} /> {step > 0 && !done ? "Atrás" : "Volver"}
            </button>
            <div>
              <p className="text-[11px] text-slate-400">
                Servicios Administrativos · Reservas
              </p>
              <h1 className="text-base font-bold text-slate-800">Reserva de sala</h1>
            </div>
          </div>
          <div className="mt-5">
            <PageStepIndicator current={step} />
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-0">

        {/* ── STEP 0 — Seleccionar sala ─────────────────────────────── */}
        {step === 0 && (
          <section>
            <h2 className="mb-1 text-lg font-bold text-slate-800">¿Qué sala necesitas?</h2>
            <p className="mb-6 text-sm text-slate-400">
              Selecciona la sala según la capacidad y equipamiento que requieres.
            </p>
            {roomsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selected={selectedRoom?.id === room.id}
                    onSelect={() => { setSelectedRoom(room); setStep(1); }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── STEP 1 — Fecha y disponibilidad ──────────────────────── */}
        {step === 1 && selectedRoom && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <aside className="flex flex-col gap-4 lg:col-span-1">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 mb-1">
                  Sala seleccionada
                </p>
                <p className="font-bold text-slate-800">{selectedRoom.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {selectedRoom.floor} · {selectedRoom.capacity} personas
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedRoom.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-full
                      bg-rose-100/60 border border-rose-200 px-2 py-0.5 text-[10px]
                      font-medium text-rose-700">
                      {AMENITY_ICONS[a] ?? null} {a}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setStep(0)}
                  className="mt-3 text-[11px] text-rose-600 hover:underline font-medium"
                >
                  Cambiar sala
                </button>
              </div>

              <FieldWrapper label="Fecha">
                <input
                  type="date"
                  min={todayISO()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5
                    py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2
                    focus:ring-rose-100 focus:border-rose-300 transition-all"
                />
              </FieldWrapper>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Selección actual
                </p>
                {selectedStart ? (
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Clock size={13} className="text-rose-500" />
                      <span className="font-semibold">{selectedStart}</span>
                      {selectedEnd && selectedEnd !== selectedStart && (
                        <>
                          <ArrowRight size={11} className="text-slate-400" />
                          <span className="font-semibold">{computedEndTime()}</span>
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">{selectedDate}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Haz clic en un horario disponible →
                  </p>
                )}
              </div>

              {selectedStart && (
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-700
                    px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all
                    hover:bg-rose-800 active:scale-[0.98]"
                >
                  Continuar <ArrowRight size={15} />
                </button>
              )}
            </aside>

            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Disponibilidad</h2>
                  <p className="text-xs text-slate-400">
                    Haz clic en un slot para elegir inicio; vuelve a hacer clic para extender el rango.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-rose-600" /> Selec.
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-slate-200" /> Libre
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-slate-100 border" /> Ocupado
                  </span>
                </div>
              </div>
              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
                  ))}
                </div>
              ) : (
                <>
                  <SlotGrid
                    slots={slots}
                    selectedStart={selectedStart}
                    selectedEnd={selectedEnd}
                    onToggle={handleSlotToggle}
                  />
                  {timeErr && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
                      <AlertCircle size={12} /> {timeErr}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2 — Detalle de la reserva ───────────────────────── */}
        {step === 2 && selectedRoom && (
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-1 text-lg font-bold text-slate-800">Detalle de la reserva</h2>
            <p className="mb-6 text-sm text-slate-400">Completa los datos de la reunión.</p>

            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-rose-200
              bg-rose-50 px-5 py-4">
              <CalendarDays size={20} className="shrink-0 text-rose-600" />
              <div className="text-sm">
                <p className="font-semibold text-slate-800">{selectedRoom.name}</p>
                <p className="text-slate-500 text-xs">
                  {selectedDate} · {selectedStart}
                  {selectedEnd && selectedEnd !== selectedStart
                    ? ` → ${computedEndTime()}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <FieldWrapper
                label="Título / motivo de la reunión"
                required
                {...(titleErr && { error: titleErr })}
              >
                <Input
                  placeholder="Ej. Revisión estratégica Q3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={!!titleErr}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Número de asistentes"
                hint={`Máximo: ${selectedRoom.capacity}`}
              >
                <Input
                  type="number"
                  min={1}
                  max={selectedRoom.capacity}
                  placeholder="Ej. 6"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                />
              </FieldWrapper>

              <FieldWrapper label="Observaciones" hint="Configuración especial, catering, etc.">
                <Textarea
                  placeholder="Información adicional para recepción…"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FieldWrapper>

              {timeErr && (
                <p className="flex items-center gap-1.5 rounded-xl bg-rose-50 border
                  border-rose-200 px-3.5 py-2.5 text-xs text-rose-700">
                  <AlertCircle size={13} /> {timeErr}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm
                    font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  ← Atrás
                </button>
                <SubmitButton
                  loading={loading}
                  label="Confirmar reserva"
                  loadingLabel="Reservando…"
                  onClick={handleBook}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Confirmado ───────────────────────────────────── */}
        {step === 3 && done && (
          <div className="mx-auto max-w-md">
            <SuccessBanner
              title="¡Sala reservada!"
              message="La reserva ha sido registrada. Recibirás una confirmación por correo."
              id={bookingId}
              onClose={() => router.back()}
              extra={
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Resumen
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <dt className="text-slate-500">Sala</dt>
                    <dd className="font-medium text-slate-800">{selectedRoom?.name}</dd>
                    <dt className="text-slate-500">Fecha</dt>
                    <dd className="font-medium text-slate-800">{selectedDate}</dd>
                    <dt className="text-slate-500">Horario</dt>
                    <dd className="font-medium text-slate-800">
                      {selectedStart} → {computedEndTime()}
                    </dd>
                    <dt className="text-slate-500">Reunión</dt>
                    <dd className="font-medium text-slate-800 truncate">{title}</dd>
                  </dl>
                </div>
              }
            />
          </div>
        )}

      </div>
    </main>
  );
}