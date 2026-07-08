# Proof of Concept (POC): End-to-End Role-Based Logistics Tracking

This document details the **Proof of Concept (POC)** for the multi-role logistics tracking system built for **Libya Logistics**. 

The system implements a structured custody-chain tracking flow, moving shipments from initial registration to customer handover, utilizing a React frontend styled with the Clay Design System and a Node.js/Express backend connected to MongoDB.

---

## 🏗️ 1. Architecture & Technology Stack

The application is structured as a decoupled client-server architecture:

```
                  ┌──────────────────────────────┐
                  │        React Frontend        │
                  │   (Vite, Zustand, Axios)     │
                  └──────────────┬───────────────┘
                                 │ HTTP / JSON
                                 ▼
                  ┌──────────────────────────────┐
                  │    Node.js Express Backend   │
                  │  (JWT Session, Controllers)  │
                  └──────────────┬───────────────┘
                                 │ Mongoose
                                 ▼
                  ┌──────────────────────────────┐
                  │       MongoDB Database       │
                  │      (Atlas / Logistics)     │
                  └──────────────────────────────┘
```

- **Frontend**: Built using React 19, Vite, Zustand (state management), Axios (API client), Recharts (data visualizations), and styled using custom HSL/RGB CSS variables defined by the Clay Design System.
- **Backend**: Built using Express, Mongoose (MongoDB ORM), and bcryptjs (password security).
- **Database**: MongoDB cloud instance storing collections for `users`, `roles`, `warehouses`, `customers`, and `shipments`.

---

## 👥 2. User Roles & Permission Matrix

The system enforces strict role-based access control (RBAC) to ensure that users only perform activities corresponding to their designated role and assigned physical location:

| Action / Page | Super Admin | Warehouse Operator | Warehouse Manager |
| :--- | :---: | :---: | :---: |
| **View Dashboard Stats & Charts** | Yes | Yes (General) | Yes (General) |
| **Add New Warehouses** | Yes | No | No |
| **Create System Users / Assign Locations** | Yes | No | No |
| **Book New Shipment (at Origin)** | No | Yes (Origin Wh only) | No |
| **Store Shipment (Local Warehouse)** | No | Yes (Origin Wh only) | Yes (Origin Wh only) |
| **Dispatch Shipment (Authorize Departure)** | No | No | Yes (Origin Wh only) |
| **Set Fleet Status to "In Transit"** | No | No | Yes (Any Location) |
| **Receive Shipment (Destination)** | No | No | Yes (Dest Wh only) |
| **Mark Ready for Pickup** | No | No | Yes (Dest Wh only) |
| **Release to Customer (Final Verification)** | No | No | Yes (Dest Wh only) |

---

## 🔄 3. Step-by-Step Logistics Flow

The custody-chain lifecycle progress for any registered package proceeds through these exact states:

```
 ┌───────────┐      ┌───────────┐      ┌──────────────┐      ┌────────────┐
 │  BOOKED   │ ───> │  STORED   │ ───> │  DISPATCHED  │ ───> │ IN_TRANSIT │
 └───────────┘      └───────────┘      └──────────────┘      └────────────┘
                                                                    │
 ┌───────────┐      ┌──────────────┐      ┌────────────┐            │
 │ COMPLETED │ <─── │ READY_PICKUP │ <─── │  RECEIVED  │ <──────────┘
 └───────────┘      └──────────────┘      └────────────┘
```

### Step 1: Super Admin Setup
- **Action**: Super Admin logs in, accesses `/warehouses` and `/users`, and registers physical warehouse hubs (e.g., `Tripoli Central`, `Benghazi Main`, `Misrata Hub`) and creates operator/manager accounts assigned to these hubs.

### Step 2: Book Shipment (Status: `BOOKED`)
- **Action**: Operator at the origin warehouse (e.g., Tripoli Central) fills in the customer details, package specifications, and destination hub (e.g., Benghazi Main).
- **Audit**: System generates a unique barcode, QR code, shipment number (`LY-2026-XXXXXX`), and logs:
  - *Status:* `BOOKED`
  - *Location:* Tripoli Central
  - *Actor:* Tripoli Operator

### Step 3: Local Storage (Status: `STORED`)
- **Action**: Operator verifies physical custody of the package at the warehouse and clicks **"Store in Warehouse"**.
- **Audit**: Log entry records the package is stored in the local warehouse.

### Step 4: Authorize Dispatch (Status: `DISPATCHED`)
- **Action**: The Manager at the origin warehouse (Tripoli Central) clicks **"Dispatch from Warehouse"** and records vehicle/carrier details (e.g., *"Truck LY8822, Driver: Fawzi"*).

### Step 5: Depart Hub (Status: `IN_TRANSIT`)
- **Action**: Manager marks the shipment as departed, changing the status to **"In Transit"**.

### Step 6: Arrive at Destination (Status: `RECEIVED`)
- **Action**: The Manager at the destination warehouse (Benghazi Main) sees the incoming shipment in their dashboard and clicks **"Receive at Destination"** to log its arrival.

### Step 7: Handover Cataloging (Status: `READY_FOR_PICKUP`)
- **Action**: Destination Manager inspects the parcel, marks it ready, and triggers the status **"Ready for Pickup"** (alerting the customer).

### Step 8: Customer Handover (Status: `COMPLETED`)
- **Action**: The recipient arrives at the Benghazi Main warehouse. The Manager clicks **"Release to Customer"**, verifies the recipient's National ID/Passport, collects a contact phone number and remarks, and marks the shipment as **"Completed"**.

---

## 🔌 4. API Endpoint Definitions

### Authentication
- `POST /api/users/login`: Authenticate email/password credentials. Returns user details, role title, and assigned warehouse details.

### Users & Roles
- `GET /api/users`: Get a list of all system users (excluding passwords).
- `POST /api/users`: Create a new staff account (Super Admin only).
- `GET /api/users/roles`: List available security roles.

### Warehouses
- `GET /api/warehouses`: Retrieve all registered warehouse locations.
- `POST /api/warehouses`: Register a new physical hub (Super Admin only).

### Customers
- `GET /api/customers`: Retrieve registered customer list.
- `POST /api/customers`: Create a new customer profile (mobile numbers must be unique).

### Shipments
- `GET /api/shipments`: Fetch all shipments.
- `GET /api/shipments/:id`: Fetch tracking details, specifications, and full audit logs for a single shipment.
- `POST /api/shipments`: Register a new booking (status defaults to `BOOKED`).
- `PATCH /api/shipments/:id/status`: Transition the status. For `COMPLETED` transitions, it validates and stores the receiver's pickup verification structure.

---

## 📊 5. Database Schema Structures

### User Schema (`User.js`)
```javascript
{
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: Schema.Types.ObjectId, ref: "Role" },
  warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
  status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" }
}
```

### Shipment Schema (`Shipment.js`)
```javascript
{
  shipmentNumber: { type: String, unique: true },
  barcode: String,
  qrCode: String,
  originWarehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
  destinationWarehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
  senderCustomer: { type: Schema.Types.ObjectId, ref: "Customer" },
  receiverCustomer: { type: Schema.Types.ObjectId, ref: "Customer" },
  goodsDescription: String,
  packageCount: Number,
  weight: Number,
  declaredValue: Number,
  currentStatus: String,
  currentWarehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
  bookedBy: { type: Schema.Types.ObjectId, ref: "User" },
  statusHistory: [{
    status: String,
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    remarks: String,
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: Date
  }],
  pickup: {
    receiverName: String,
    receiverPhone: String,
    nationalId: String,
    pickupDate: Date,
    remarks: String
  }
}
```

---

## 🚀 6. Running and Demonstrating the POC

### Backend Setup
1. Open a terminal in `backend/` and run `npm install`.
2. Configure `.env` with a `MONGO_URI` and `PORT=5000`.
3. Run `npm run seed` to seed default warehouses, roles, customers, and demo users.
4. Start the server using `npm run dev`.

### Frontend Setup
1. Open a terminal in `frontend/` and run `npm install`.
2. Start the React server using `npm run dev`.
3. Open browser on the designated port (typically `http://localhost:5173/`).

### Demo Switcher Shortcut
To test the flow without manually typing credentials and logging in/out constantly, use the **"Switch User:" select dropdown** in the Topbar. This allows you to hot-swap between:
- **Super Admin** (`admin@libya.com`)
- **Tripoli Operator** (`operator.tripoli@libya.com`)
- **Tripoli Manager** (`manager.tripoli@libya.com`)
- **Benghazi Manager** (`manager.benghazi@libya.com`)
instantly to perform role-specific duties.
