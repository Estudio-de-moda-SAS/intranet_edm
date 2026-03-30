export default function ITServerActivityCard({ data }: any) {

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">

      <h2 className="font-semibold mb-4">
        Actividad Servidores
      </h2>

      <ul className="space-y-2 text-sm">

        {data.activity.map((event: any, i: number) => (
          <li key={i} className="flex justify-between">

            <span>{event.message}</span>

            <span className="text-gray-400">
              {event.time}
            </span>

          </li>
        ))}

      </ul>

    </div>
  );
}