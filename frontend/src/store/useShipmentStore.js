import { create } from "zustand";
import api from "../services/api";

const useShipmentStore = create((set) => ({
  shipments: [],
  activities: [],
  loading: false,

  fetchShipments: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/shipments");
      const shipments = res.data.data || [];

      // Extract and aggregate activities from all shipments' status histories
      const allActivities = [];
      shipments.forEach(shipment => {
        shipment.statusHistory.forEach(hist => {
          allActivities.push({
            id: `${shipment._id}-${hist.status}-${hist.createdAt}`,
            text: `Shipment ${shipment.shipmentNumber} marked as ${hist.status} at ${hist.warehouse?.name || "Transit"}`,
            date: new Date(hist.createdAt)
          });
        });
      });

      // Sort activities: latest first
      allActivities.sort((a, b) => b.date - a.date);

      set({
        shipments,
        activities: allActivities.slice(0, 15),
        loading: false
      });
    } catch (err) {
      console.error("Failed to fetch shipments:", err);
      set({ loading: false });
    }
  }
}));

export default useShipmentStore;