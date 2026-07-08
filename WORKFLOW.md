# Full Logistics Workflow: Custody-Chain Tracking System

This document outlines the **full operational and code execution workflow** of the Libya Logistics tracking system. 

It details the business logic, state transition safety rules, code structures, and user action steps required to move a shipment from its initial booking to final recipient release.

---

## 🔄 1. The Custody-Chain Paradigm

In logistics, packages must never exist without an assigned physical location and a responsible handler. This application implements a **custody-chain pattern** to track custody changes:

- **Inside a Warehouse**: When stored, the package is mapped to a specific `currentWarehouse`.
- **In Transit**: When dispatched, the package is mapped to a carrier vehicle/driver (with `currentWarehouse` set to `null` to denote transit state).
- **Custodian Logging**: Every transition records the timestamp, location, action, and the specific user ID who signed off on the state change.

---

## 👥 2. Workflow Roles & User Personas

### A. Super Admin (System Director)
- **Role**: Initializes the operational landscape.
- **System Scope**: Cross-warehouse access.
- **Duties**:
  1. Register physical warehouse locations.
  2. Create employee user accounts.
  3. Assign personnel to roles and warehouses.

### B. Warehouse Operator (Frontline clerk)
- **Role**: Receives cargo from sender customers at the origin hub.
- **System Scope**: Restricted to their assigned warehouse.
- **Duties**:
  1. Book new shipments (sender/receiver names, package size, weight, value).
  2. Receive physical parcel from sender customer and mark as stored in warehouse.

### C. Warehouse Manager (Operations supervisor)
- **Role**: Approves routing and verifies handovers.
- **System Scope**: Restricted to their assigned warehouse (except for fleet tracking).
- **Duties**:
  1. Authorize dispatch departures (assign drivers/trucks).
  2. Verify incoming transit fleet arrivals.
  3. Prepare items for collection.
  4. Perform ID verification and sign off final customer releases.

---

## 📈 3. Detailed Status Transition Engine

To prevent packages from bypassing safety checks (e.g. marking an in-transit package as completed without receiving it), the system enforces sequential state machine rules.

### State Transition Matrix:

| Current Status | Action | Next Status | Authorized Location | Authorized Role |
| :--- | :--- | :--- | :--- | :--- |
| **None** | Book shipment | `BOOKED` | Origin Warehouse | Operator |
| `BOOKED` | Store in Warehouse | `STORED` | Origin Warehouse | Operator / Manager |
| `STORED` | Authorize departure | `DISPATCHED` | Origin Warehouse | Manager |
| `DISPATCHED` | Depart vehicle fleet | `IN_TRANSIT` | Origin Warehouse | Manager |
| `IN_TRANSIT` | Verify truck arrival | `RECEIVED` | Destination Warehouse | Manager |
| `RECEIVED` | Catalog for pickup | `READY_FOR_PICKUP` | Destination Warehouse | Manager |
| `READY_FOR_PICKUP` | ID verify and release | `COMPLETED` | Destination Warehouse | Manager |

---

## 💻 4. Code & API Execution Flow

The sequence below describes what happens under the hood across the frontend, API routes, and database models during each lifecycle phase:

```
[Frontend UI Page]  ──(Axios Request)──>  [Express Router]  ──(Controller Check)──>  [MongoDB Model]
       ▲                                                                                   │
       └──────────────────(Return JSON Update Response)────────────────────────────────────┘
```

### Phase 1: Booking a Shipment
1. **Frontend**: The operator clicks "Book Shipment" in [Shipments.jsx](file:///D:/ML%20Project/logistics/frontend/src/pages/Shipments.jsx). The page automatically locks the `originWarehouse` value to the logged-in user's assigned warehouse.
2. **Customer Registration**: The frontend queries the `/api/customers` endpoint to verify if the sender and receiver mobile numbers exist. If not, it calls `POST /api/customers` to create customer profiles.
3. **Shipment Creation**: The frontend sends a `POST /api/shipments` payload containing:
   - `originWarehouse` (Tripoli Central)
   - `destinationWarehouse` (Benghazi Main)
   - `senderCustomer` (ID)
   - `receiverCustomer` (ID)
   - Specifications (description, package count, weight, value)
   - `bookedBy` (Operator User ID)
4. **Backend**: The [shipmentController.js](file:///D:/ML%20Project/logistics/backend/src/controllers/shipmentController.js) runs:
   - Call `generateShipmentNumber()` (looks up total shipment count to generate `LY-2026-XXXXXX` format).
   - Generates barcodes (`BAR-LY-2026-XXXXXX`) and QR codes.
   - Saves record with status `BOOKED` and pushes the initial event into the `statusHistory` array.
5. **Database**: Saves a new document in the `shipments` collection.

### Phase 2: Local Storing
1. **Frontend**: The operator views the shipment registry and clicks **"Store in Wh"** on the booked row, or clicks it on the Shipment Details page.
2. **Backend**: Calls `PATCH /api/shipments/:id/status` sending `{ status: "STORED", warehouse: userWarehouseId, remarks: "Stored in warehouse", updatedBy: userId }`.
3. **Database**: Updates `currentStatus` to `STORED`, `currentWarehouse` to origin warehouse ID, and appends the event into `statusHistory`.

### Phase 3: Dispatch & Departure
1. **Frontend**: Tripoli Manager opens the details page for a shipment in `STORED` status. They click **"Dispatch from Warehouse"**.
2. **Modal Form**: The manager enters truck/driver remarks (e.g. *"Truck TRK-990, Driver Fawzi"*).
3. **Backend**: Calls `PATCH /api/shipments/:id/status` with status `DISPATCHED`. Pushes remarks and warehouse context into history.
4. **Transit Trigger**: Tripoli Manager clicks **"Mark In Transit"** once the fleet leaves. Calls `PATCH /api/shipments/:id/status` with status `IN_TRANSIT` and sets `warehouse` parameter to `null` (since it is mobile).

### Phase 4: Arrival & Collection Handover
1. **Frontend**: Benghazi Manager logs in. The dashboard aggregates incoming active cargo.
2. **Receive cargo**: The manager clicks **"Receive at Destination"** when the carrier arrives. The backend updates status to `RECEIVED` and assigns `currentWarehouse` to Benghazi Main.
3. **Mark Ready**: The manager clicks **"Mark Ready for Pickup"** once the parcel is placed on the collection shelves. Status updates to `READY_FOR_PICKUP`.
4. **Release Handover**: The manager clicks **"Release to Customer"**. A verification modal displays, requiring the manager to enter:
   - Verified Receiver Name
   - Receiver Phone
   - National Identification Card (ID) or Passport number
   - Remarks
5. **Final Save**: Calls `PATCH /api/shipments/:id/status` with status `COMPLETED`. The controller verifies details and saves the `pickup` structure under the shipment document.
6. **Timeline Rendering**: [ShipmentDetails.jsx](file:///D:/ML%20Project/logistics/frontend/src/pages/ShipmentDetails.jsx) compiles the `statusHistory` list, displaying a visual vertical tracking timeline showing timestamps, location changes, notes, and employee names who authorized each step.

---

## 🏃 5. Step-by-Step Demo Walkthrough Script

To execute and demo this complete flow inside the browser, follow this script:

### 1. Register Location & Staff
- **Role**: Super Admin (`admin@libya.com` / `password123`)
- **Steps**:
  1. Navigate to **Warehouses** -> click **Add Warehouse** -> register "Zuwarah Terminal" (Code: `ZUH`).
  2. Navigate to **Users** -> click **Add User** -> register employee "Zuwarah Operator" (`operator.zuwarah@libya.com`, select role `Warehouse Operator`, assign to `Zuwarah Terminal`).

### 2. Register & Store Cargo
- **Role**: Tripoli Operator (`operator.tripoli@libya.com` / `password123`)
- **Steps**:
  1. Select Tripoli Operator using Topbar user switcher.
  2. Navigate to **Shipments** -> click **Book Shipment**.
  3. Select Destination Warehouse: `Benghazi Main`. Fill out sender, receiver, and parcel specs, and submit.
  4. Find the shipment in the table (status: `Booked`) and click **"Store in Wh"**. Status updates to `Stored`.

### 3. Route Fleet
- **Role**: Tripoli Manager (`manager.tripoli@libya.com` / `password123`)
- **Steps**:
  1. Switch to Tripoli Manager using Topbar.
  2. Navigate to **Shipments** -> click **Manage Flow** on the shipment.
  3. Click **Dispatch from Warehouse** -> enter vehicle code and confirm. Status becomes `Dispatched`.
  4. Click **Mark In Transit** to move the cargo onto the fleet. Status becomes `In Transit`.

### 4. Receive and Complete Handover
- **Role**: Benghazi Manager (`manager.benghazi@libya.com` / `password123`)
- **Steps**:
  1. Switch to Benghazi Manager using Topbar.
  2. Navigate to **Shipments** -> click **Manage Flow** on the shipment.
  3. Click **Receive at Destination**. Status becomes `Received` (current warehouse updates to Benghazi Main).
  4. Click **Mark Ready for Pickup**. Status becomes `Ready Pickup`.
  5. Click **Release to Customer** -> confirm receiver's National ID verification, enter signature remarks, and complete. Status becomes `Completed`.
  6. The tracking history is fully displayed as a verified audit timeline.
