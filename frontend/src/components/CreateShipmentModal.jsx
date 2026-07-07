import { useState } from "react";
import useShipmentStore from "../store/useShipmentStore";

export default function CreateShipmentModal({
  open,
  onClose
}) {
  const addShipment =
    useShipmentStore(
      (state) => state.addShipment
    );

  const [form, setForm] = useState({
    sender: "",
    receiver: "",
    origin: "",
    destination: ""
  });

  if (!open) return null;

  const submit = () => {
    addShipment({
      id: Date.now(),

      shipmentNo:
        "LIB2507" +
        Math.floor(
          1000 + Math.random() * 9000
        ),

      ...form,

      status: "Booked",

      createdAt: new Date()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl p-6 w-[700px]">

        <h2 className="text-2xl font-bold mb-6">
          Create Shipment
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <input
            placeholder="Sender Name"
            className="border p-3 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                sender: e.target.value
              })
            }
          />

          <input
            placeholder="Receiver Name"
            className="border p-3 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                receiver: e.target.value
              })
            }
          />

          <input
            placeholder="Origin"
            className="border p-3 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                origin: e.target.value
              })
            }
          />

          <input
            placeholder="Destination"
            className="border p-3 rounded"
            onChange={(e) =>
              setForm({
                ...form,
                destination:
                  e.target.value
              })
            }
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create
          </button>

        </div>

      </div>

    </div>
  );
}