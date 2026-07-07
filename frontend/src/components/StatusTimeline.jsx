const statuses = [
  "Booked",
  "Stored",
  "Ready Dispatch",
  "In Transit",
  "Received",
  "Ready Pickup",
  "Completed"
];

export default function StatusTimeline({
  currentStatus
}) {
  const activeIndex =
    statuses.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between">

      {statuses.map((status, index) => (
        <div
          key={status}
          className="flex-1 flex flex-col items-center"
        >
          <div
            className={`w-8 h-8 rounded-full ${
              index <= activeIndex
                ? "bg-blue-600"
                : "bg-slate-300"
            }`}
          />

          <span className="text-xs mt-2 text-center">
            {status}
          </span>
        </div>
      ))}
    </div>
  );
}