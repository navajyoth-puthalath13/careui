import React from "react";
import { type ComponentDoc } from "@/lib/types";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ColumnDef,
  type Header,
  type Row,
  type RowPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, GripVertical, HeartPulse, MapPin, Pin, PinOff, Stethoscope, User } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Patient data ─────────────────────────────────────────────────────────────

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  ward: string;
  bed: string;
  diagnosis: string;
  status: "admitted" | "critical" | "stable" | "discharged";
};

const patients: Patient[] = [
  { id: "OHC-0041", name: "Ravi Kumar",      age: 45, gender: "M", ward: "General",    bed: "G-12",  diagnosis: "Hypertension",             status: "stable"     },
  { id: "OHC-0042", name: "Priya Sharma",    age: 32, gender: "F", ward: "Maternity",  bed: "M-03",  diagnosis: "Post-op recovery",          status: "admitted"   },
  { id: "OHC-0043", name: "Arjun Mehta",     age: 67, gender: "M", ward: "ICU",        bed: "I-01",  diagnosis: "Cardiac arrest",            status: "critical"   },
  { id: "OHC-0044", name: "Sunita Rao",      age: 28, gender: "F", ward: "Surgical",   bed: "S-07",  diagnosis: "Appendicitis",              status: "admitted"   },
  { id: "OHC-0045", name: "Mohammed Ali",    age: 55, gender: "M", ward: "General",    bed: "G-05",  diagnosis: "Diabetes mellitus",         status: "stable"     },
  { id: "OHC-0046", name: "Lakshmi Nair",    age: 73, gender: "F", ward: "Geriatric",  bed: "GR-02", diagnosis: "COPD",                      status: "stable"     },
  { id: "OHC-0047", name: "Vivek Patel",     age: 41, gender: "M", ward: "Surgical",   bed: "S-11",  diagnosis: "Cholecystectomy",           status: "admitted"   },
  { id: "OHC-0048", name: "Ananya Singh",    age: 19, gender: "F", ward: "General",    bed: "G-18",  diagnosis: "Typhoid fever",             status: "admitted"   },
  { id: "OHC-0049", name: "Deepak Verma",    age: 60, gender: "M", ward: "ICU",        bed: "I-03",  diagnosis: "Stroke",                    status: "critical"   },
  { id: "OHC-0050", name: "Meera Krishnan",  age: 36, gender: "F", ward: "Maternity",  bed: "M-07",  diagnosis: "Normal delivery",           status: "discharged" },
  { id: "OHC-0051", name: "Rajesh Nambiar",  age: 50, gender: "M", ward: "Orthopedic", bed: "O-04",  diagnosis: "Hip replacement",           status: "admitted"   },
  { id: "OHC-0052", name: "Fatima Begum",    age: 48, gender: "F", ward: "General",    bed: "G-22",  diagnosis: "Urinary tract infection",   status: "stable"     },
];

const patientStatusVariant: Record<Patient["status"], "success" | "neutral" | "info" | "destructive"> = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
};

// ─── Medication administration data ───────────────────────────────────────────

type MedLog = {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dose: string;
  route: string;
  scheduledAt: string;
  status: "given" | "pending" | "missed";
};

const medLogs: MedLog[] = [
  { id: "ML-01", patientId: "OHC-0043", patientName: "Arjun Mehta",    medication: "Aspirin 75mg",         dose: "1 tab",   route: "Oral",    scheduledAt: "06:00 AM", status: "given"   },
  { id: "ML-02", patientId: "OHC-0041", patientName: "Ravi Kumar",     medication: "Amlodipine 5mg",       dose: "1 tab",   route: "Oral",    scheduledAt: "08:00 AM", status: "given"   },
  { id: "ML-03", patientId: "OHC-0049", patientName: "Deepak Verma",   medication: "Heparin 5000 IU",      dose: "5000 IU", route: "IV",      scheduledAt: "08:00 AM", status: "given"   },
  { id: "ML-04", patientId: "OHC-0044", patientName: "Sunita Rao",     medication: "Metronidazole 500mg",  dose: "500 mg",  route: "IV",      scheduledAt: "10:00 AM", status: "pending" },
  { id: "ML-05", patientId: "OHC-0045", patientName: "Mohammed Ali",   medication: "Metformin 500mg",      dose: "1 tab",   route: "Oral",    scheduledAt: "02:00 PM", status: "pending" },
  { id: "ML-06", patientId: "OHC-0048", patientName: "Ananya Singh",   medication: "Azithromycin 500mg",   dose: "1 cap",   route: "Oral",    scheduledAt: "08:00 AM", status: "missed"  },
  { id: "ML-07", patientId: "OHC-0046", patientName: "Lakshmi Nair",   medication: "Salbutamol 2.5mg",     dose: "2.5 mg",  route: "Inhaled", scheduledAt: "12:00 PM", status: "pending" },
  { id: "ML-08", patientId: "OHC-0043", patientName: "Arjun Mehta",    medication: "Atorvastatin 40mg",    dose: "1 tab",   route: "Oral",    scheduledAt: "10:00 PM", status: "pending" },
  { id: "ML-09", patientId: "OHC-0051", patientName: "Rajesh Nambiar", medication: "Tramadol 50mg",        dose: "50 mg",   route: "IM",      scheduledAt: "06:00 PM", status: "given"   },
  { id: "ML-10", patientId: "OHC-0052", patientName: "Fatima Begum",   medication: "Ciprofloxacin 500mg",  dose: "1 tab",   route: "Oral",    scheduledAt: "08:00 AM", status: "given"   },
];

const medStatusVariant: Record<MedLog["status"], "success" | "warning" | "destructive"> = {
  given:   "success",
  pending: "warning",
  missed:  "destructive",
};

// ─── Invoice data ─────────────────────────────────────────────────────────────

type Invoice = {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  category: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
};

const invoices: Invoice[] = [
  { id: "INV-2026-0041", patientName: "Ravi Kumar",      patientId: "OHC-0041", date: "10 Apr 2026", category: "Consultation", amount: 500,   status: "paid"    },
  { id: "INV-2026-0042", patientName: "Priya Sharma",    patientId: "OHC-0042", date: "12 Apr 2026", category: "Maternity",    amount: 18500, status: "pending" },
  { id: "INV-2026-0043", patientName: "Arjun Mehta",     patientId: "OHC-0043", date: "13 Apr 2026", category: "ICU",          amount: 24000, status: "pending" },
  { id: "INV-2026-0044", patientName: "Sunita Rao",      patientId: "OHC-0044", date: "14 Apr 2026", category: "Surgery",      amount: 32000, status: "pending" },
  { id: "INV-2026-0045", patientName: "Mohammed Ali",    patientId: "OHC-0045", date: "09 Apr 2026", category: "Consultation", amount: 750,   status: "paid"    },
  { id: "INV-2026-0046", patientName: "Lakshmi Nair",    patientId: "OHC-0046", date: "08 Apr 2026", category: "Pharmacy",     amount: 2340,  status: "overdue" },
  { id: "INV-2026-0047", patientName: "Vivek Patel",     patientId: "OHC-0047", date: "14 Apr 2026", category: "Surgery",      amount: 28000, status: "pending" },
  { id: "INV-2026-0048", patientName: "Ananya Singh",    patientId: "OHC-0048", date: "11 Apr 2026", category: "Laboratory",   amount: 1200,  status: "paid"    },
  { id: "INV-2026-0049", patientName: "Deepak Verma",    patientId: "OHC-0049", date: "13 Apr 2026", category: "ICU",          amount: 18000, status: "pending" },
  { id: "INV-2026-0050", patientName: "Meera Krishnan",  patientId: "OHC-0050", date: "10 Apr 2026", category: "Maternity",    amount: 14500, status: "paid"    },
];

const invoiceStatusVariant: Record<Invoice["status"], "success" | "warning" | "destructive"> = {
  paid:    "success",
  pending: "warning",
  overdue: "destructive",
};

// ─── Staff data ───────────────────────────────────────────────────────────────

type StaffMember = {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joined: string;
  experience: number;
  status: "active" | "inactive";
};

const staffMembers: StaffMember[] = [
  { id: "STAFF-001", name: "Dr. Kiran Reddy",       email: "kiran.reddy@ohc.in",    department: "Cardiology",       designation: "Senior Consultant",  joined: "Jan 2018", experience: 12, status: "active"   },
  { id: "STAFF-002", name: "Dr. Anita Menon",        email: "anita.menon@ohc.in",    department: "Pediatrics",       designation: "Consultant",          joined: "Mar 2020", experience:  8, status: "active"   },
  { id: "STAFF-003", name: "Dr. Suresh Pillai",      email: "suresh.pillai@ohc.in",  department: "Surgery",          designation: "Head of Department",  joined: "Jun 2015", experience: 15, status: "active"   },
  { id: "STAFF-004", name: "Nurse Rekha Thomas",     email: "rekha.thomas@ohc.in",   department: "ICU",              designation: "Senior Nurse",        joined: "Sep 2019", experience:  6, status: "inactive" },
  { id: "STAFF-005", name: "Dr. Imran Sheikh",       email: "imran.sheikh@ohc.in",   department: "Orthopedics",      designation: "Consultant",          joined: "Nov 2017", experience: 10, status: "active"   },
  { id: "STAFF-006", name: "Nurse Preethi Sajan",    email: "preethi.sajan@ohc.in",  department: "General Medicine", designation: "Staff Nurse",         joined: "Feb 2022", experience:  3, status: "active"   },
  { id: "STAFF-007", name: "Dr. Kavitha Nair",       email: "kavitha.nair@ohc.in",   department: "Neurology",        designation: "Senior Consultant",  joined: "Aug 2016", experience: 14, status: "active"   },
  { id: "STAFF-008", name: "Dr. Rajiv Kapoor",       email: "rajiv.kapoor@ohc.in",   department: "Radiology",        designation: "Consultant",          joined: "Dec 2021", experience:  5, status: "inactive" },
  { id: "STAFF-009", name: "Nurse Sumathi Krishnan", email: "sumathi.k@ohc.in",      department: "Maternity",        designation: "Senior Nurse",        joined: "Apr 2018", experience:  9, status: "active"   },
  { id: "STAFF-010", name: "Dr. Farhan Hossain",     email: "farhan.hossain@ohc.in", department: "Oncology",         designation: "Consultant",          joined: "Jul 2020", experience:  7, status: "active"   },
  { id: "STAFF-011", name: "Dr. Pooja Iyer",         email: "pooja.iyer@ohc.in",     department: "Dermatology",      designation: "Consultant",          joined: "May 2023", experience:  4, status: "active"   },
  { id: "STAFF-012", name: "Nurse Arun Mathew",      email: "arun.mathew@ohc.in",    department: "Emergency",        designation: "Charge Nurse",        joined: "Oct 2019", experience:  6, status: "inactive" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const patientCell = (name: string, id: string) =>
  React.createElement(
    "div",
    { className: "flex items-center gap-3" },
    React.createElement(Avatar, { shape: "rounded" },
      React.createElement(AvatarFallback, { color: "primary" }, getInitials(name))
    ),
    React.createElement(
      "div",
      { className: "flex flex-col" },
      React.createElement("span", { className: "font-medium" }, name),
      React.createElement("span", { className: "text-muted-foreground text-xs" }, id)
    )
  );

// ─── Patient columns (full — main preview) ────────────────────────────────────

const patientColumns: ColumnDef<Patient>[] = [
  {
    id: "select",
    header: ({ table }) =>
      React.createElement(Checkbox, {
        checked:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? "indeterminate" : false),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      React.createElement(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "patient",
    accessorKey: "name",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Patient",
      }),
    cell: ({ row }) => patientCell(row.original.name, row.original.id),
  },
  {
    id: "demographics",
    header: "Age / Gender",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "text-sm tabular-nums" },
        `${row.original.age}y ${row.original.gender}`
      ),
  },
  {
    id: "location",
    header: "Ward / Bed",
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "flex flex-col" },
        React.createElement("span", { className: "font-medium text-sm" }, row.original.ward),
        React.createElement("span", { className: "text-muted-foreground text-xs" }, row.original.bed)
      ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: patientStatusVariant[row.getValue("status") as Patient["status"]] },
        row.getValue("status")
      ),
  },
  {
    id: "actions",
    enableHiding: false,
    meta: { className: "w-0" },
    cell: ({ row }) =>
      React.createElement(
        DataTableRowActions,
        {},
        React.createElement(DropdownMenuItem, {}, "View record"),
        React.createElement(DropdownMenuItem, {}, "Edit details"),
        React.createElement(DropdownMenuSeparator, {}),
        React.createElement(DropdownMenuItem, {}, "Add note"),
        React.createElement(DropdownMenuItem, {}, "Prescribe medication"),
        React.createElement(DropdownMenuSeparator, {}),
        React.createElement(
          DropdownMenuItem,
          { className: row.original.status === "discharged" ? "text-muted-foreground" : "" },
          "Discharge patient"
        )
      ),
  },
];

// ─── Medication log columns ───────────────────────────────────────────────────

const medColumns: ColumnDef<MedLog>[] = [
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => patientCell(row.original.patientName, row.original.patientId),
  },
  {
    id: "medication",
    accessorKey: "medication",
    header: "Medication",
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "flex flex-col" },
        React.createElement("span", { className: "font-medium text-sm" }, row.original.medication),
        React.createElement(
          "span",
          { className: "text-muted-foreground text-xs" },
          `${row.original.dose} · ${row.original.route}`
        )
      ),
  },
  {
    accessorKey: "scheduledAt",
    header: "Scheduled",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "font-medium tabular-nums text-sm" },
        row.getValue("scheduledAt")
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: medStatusVariant[row.getValue("status") as MedLog["status"]] },
        row.getValue("status")
      ),
  },
];

// ─── Invoice columns ──────────────────────────────────────────────────────────

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Invoice #",
      }),
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "font-mono text-sm font-medium" },
        row.getValue("id")
      ),
  },
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => patientCell(row.original.patientName, row.original.patientId),
  },
  {
    accessorKey: "date",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Date",
      }),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>
      React.createElement(Badge, { variant: "neutral" }, row.getValue("category")),
  },
  {
    accessorKey: "amount",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Amount",
      }),
    meta: { className: "text-right" },
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "font-medium tabular-nums" },
        formatINR(row.getValue("amount"))
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: invoiceStatusVariant[row.getValue("status") as Invoice["status"]] },
        row.getValue("status")
      ),
  },
  {
    id: "actions",
    enableHiding: false,
    meta: { className: "w-0" },
    cell: ({ row }) =>
      React.createElement(
        DataTableRowActions,
        {},
        React.createElement(
          DropdownMenuItem,
          { onClick: () => navigator.clipboard.writeText(row.original.id) },
          "Copy invoice ID"
        ),
        React.createElement(DropdownMenuSeparator, {}),
        React.createElement(DropdownMenuItem, {}, "View invoice"),
        React.createElement(DropdownMenuItem, {}, "Download PDF"),
        React.createElement(DropdownMenuSeparator, {}),
        React.createElement(DropdownMenuItem, {}, "Mark as paid"),
        React.createElement(
          DropdownMenuItem,
          { className: "text-destructive" },
          "Void invoice"
        )
      ),
  },
];

// ─── Sortable staff columns ──────────────────────────────────────────────────

const staffCell = (name: string, email: string) =>
  React.createElement(
    "div",
    { className: "flex items-center gap-3" },
    React.createElement(Avatar, { shape: "circle" },
      React.createElement(AvatarFallback, { color: "primary" }, getInitials(name))
    ),
    React.createElement(
      "div",
      { className: "flex flex-col" },
      React.createElement("span", { className: "font-medium" }, name),
      React.createElement("span", { className: "text-muted-foreground text-xs" }, email)
    )
  );

const sortableStaffColumns: ColumnDef<StaffMember>[] = [
  {
    id: "staff",
    accessorKey: "name",
    enableSorting: true,
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Staff",
      }),
    cell: ({ row }) => staffCell(row.original.name, row.original.email),
  },
  {
    accessorKey: "department",
    enableSorting: true,
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Department",
      }),
  },
  {
    accessorKey: "designation",
    enableSorting: true,
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Designation",
      }),
  },
  {
    accessorKey: "experience",
    enableSorting: true,
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Experience",
      }),
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "tabular-nums" },
        `${row.getValue("experience")} yrs`
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: row.getValue("status") === "active" ? "success" : "neutral" },
        row.getValue("status")
      ),
  },
];

// ─── Preview components ───────────────────────────────────────────────────────

const PatientTableDemo = () =>
  React.createElement(DataTable as any, {
    columns: patientColumns,
    data: patients,
    filterColumn: "name",
    filterPlaceholder: "Search patients...",
  });

const MedLogDemo = () =>
  React.createElement(DataTable as any, {
    columns: medColumns,
    data: medLogs,
    filterColumn: "patientName",
    filterPlaceholder: "Search by patient...",
  });

const InvoiceDemo = () =>
  React.createElement(DataTable as any, {
    columns: invoiceColumns,
    data: invoices,
    filterColumn: "patientName",
    filterPlaceholder: "Search by patient...",
  });

const SortablePatientDemo = () =>
  React.createElement(DataTable as any, {
    columns: sortableStaffColumns,
    data: staffMembers,
    filterColumn: "name",
    filterPlaceholder: "Search staff...",
  });

const MovableColumnsDemo = () =>
  React.createElement(DataTable as any, {
    columns: sortableStaffColumns,
    data: staffMembers,
    filterColumn: "name",
    filterPlaceholder: "Search staff...",
    movableColumns: true,
  });

// ─── Draggable columns data & demo ───────────────────────────────────────────

type DndMember = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  company: string;
  role: string;
  status: "active" | "inactive";
};

const dndMembers: DndMember[] = [
  { id: "1",  name: "Alex Johnson",      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80", email: "alex@apple.com",    company: "Apple",      role: "CEO",             status: "active"   },
  { id: "2",  name: "Sarah Chen",        avatar: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80", email: "sarah@openai.com",  company: "OpenAI",     role: "CTO",             status: "inactive" },
  { id: "3",  name: "Michael Rodriguez", avatar: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80", email: "michael@meta.com",  company: "Meta",       role: "Designer",        status: "active"   },
  { id: "4",  name: "Emma Wilson",       avatar: "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80", email: "emma@tesla.com",    company: "Tesla",      role: "Developer",       status: "inactive" },
  { id: "5",  name: "David Kim",         avatar: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80", email: "david@sap.com",     company: "SAP",        role: "Lawyer",          status: "inactive" },
  { id: "6",  name: "Aron Thompson",     avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80", email: "aron@keen.com",     company: "Keenthemes", role: "Director",        status: "active"   },
  { id: "7",  name: "James Brown",       avatar: "https://images.unsplash.com/photo-1543299750-19d1d6297053?w=96&h=96&dpr=2&q=80", email: "james@bbva.es",     company: "BBVA",       role: "Product Manager", status: "inactive" },
  { id: "8",  name: "Maria Garcia",      avatar: "https://images.unsplash.com/photo-1620075225255-8c2051b6c015?w=96&h=96&dpr=2&q=80", email: "maria@sony.jp",     company: "Sony",       role: "Marketing Lead",  status: "inactive" },
  { id: "9",  name: "Nick Johnson",      avatar: "https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?w=96&h=96&dpr=2&q=80", email: "nick@lvmh.fr",      company: "LVMH",       role: "Data Scientist",  status: "inactive" },
  { id: "10", name: "Liam Thompson",     avatar: "https://images.unsplash.com/photo-1542595913-85d69b0edbaf?w=96&h=96&dpr=2&q=80", email: "liam@eni.it",       company: "ENI",        role: "Engineer",        status: "inactive" },
  { id: "11", name: "Pooja Iyer",        avatar: "https://images.unsplash.com/photo-1619946794135-5bc917a27793?w=96&h=96&dpr=2&q=80", email: "pooja@tata.in",     company: "Tata",       role: "Sales Manager",   status: "active"   },
];

function DndSortableHeader({
  header,
  transform,
  isDragging,
  noTransition,
  onRef,
}: {
  header: Header<DndMember, unknown>;
  transform: number;
  isDragging: boolean;
  noTransition: boolean;
  onRef: (el: HTMLElement | null) => void;
}) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: header.id });

  return (
    <TableHead
      ref={(el) => { setNodeRef(el); onRef(el); }}
      colSpan={header.colSpan}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: transform !== 0 ? `translateX(${transform}px)` : undefined,
        position: transform !== 0 || isDragging ? "relative" : undefined,
        zIndex: isDragging ? 10 : undefined,
        transition: (isDragging || noTransition) ? "none" : "transform 100ms ease",
      }}
    >
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder column"
        >
          <GripVertical className="size-3.5" />
        </button>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </TableHead>
  );
}

const dndMemberColumns: ColumnDef<DndMember>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="circle">
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{row.original.name}</span>
      </div>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.original.email}</span>
    ),
  },
  {
    id: "company",
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <span className="font-medium text-sm">{row.original.company}</span>
    ),
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Occupation",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.role}</span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status === "active"
        ? React.createElement(Badge, { variant: "success" }, "Approved")
        : React.createElement(Badge, { variant: "warning" }, "Pending"),
  },
];

function DraggableColumnsDemo() {
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    dndMemberColumns.map((c) => c.id as string)
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [activeDelta, setActiveDelta] = React.useState(0);
  const [noTransition, setNoTransition] = React.useState(false);
  const headerRefs = React.useRef<Record<string, HTMLElement | null>>({});

  // Compute how far each non-dragged column should shift to make room
  const displacements = React.useMemo<Record<string, number>>(() => {
    if (!activeId || !overId) return {};
    const activeIdx = columnOrder.indexOf(activeId);
    const overIdx = columnOrder.indexOf(overId);
    if (activeIdx === overIdx) return {};
    const activeWidth = headerRefs.current[activeId]?.offsetWidth ?? 0;
    const result: Record<string, number> = {};
    for (const id of columnOrder) {
      if (id === activeId) continue;
      const idx = columnOrder.indexOf(id);
      if (activeIdx < overIdx && idx > activeIdx && idx <= overIdx)
        result[id] = -activeWidth;
      else if (activeIdx > overIdx && idx < activeIdx && idx >= overIdx)
        result[id] = activeWidth;
    }
    return result;
  }, [activeId, overId, columnOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setNoTransition(true);
    if (active && over && active.id !== over.id) {
      setColumnOrder((order) => {
        const oldIdx = order.indexOf(active.id as string);
        const newIdx = order.indexOf(over.id as string);
        return arrayMove(order, oldIdx, newIdx);
      });
    }
    setActiveId(null);
    setOverId(null);
    setActiveDelta(0);
    requestAnimationFrame(() => setNoTransition(false));
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: dndMembers,
    columns: dndMemberColumns,
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => { setActiveId(active.id as string); setOverId(active.id as string); setActiveDelta(0); }}
      onDragMove={({ delta }) => setActiveDelta(delta.x)}
      onDragOver={({ over }) => setOverId(over?.id as string ?? null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setNoTransition(true); setActiveId(null); setOverId(null); setActiveDelta(0); requestAnimationFrame(() => setNoTransition(false)); }}
    >
      <div className="overflow-hidden rounded-md border [&_td:not(:last-child)]:border-r [&_th:not(:last-child)]:border-r">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => (
                    <DndSortableHeader
                      key={header.id}
                      header={header}
                      transform={activeId === header.id ? activeDelta : (displacements[header.id] ?? 0)}
                      isDragging={activeId === header.id}
                      noTransition={noTransition}
                      onRef={(el) => { headerRefs.current[header.id] = el; }}
                    />
                  ))}
                </SortableContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const dragging = activeId === cell.column.id;
                  const tx = dragging ? activeDelta : (displacements[cell.column.id] ?? 0);
                  return (
                    <TableCell
                      key={cell.id}
                      style={tx !== 0 || dragging ? {
                        transform: `translateX(${tx}px)`,
                        position: "relative",
                        zIndex: dragging ? 10 : undefined,
                        opacity: dragging ? 0.6 : 1,
                        transition: (dragging || noTransition) ? "none" : "transform 100ms ease",
                      } : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}

// ─── Cell-border columns ──────────────────────────────────────────────────────

const cellBorderColumns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Name",
      }),
    cell: ({ row }) => patientCell(row.original.name, row.original.id),
  },
  {
    accessorKey: "ward",
    header: "Ward",
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "flex flex-col" },
        React.createElement("span", { className: "font-medium text-sm" }, row.original.ward),
        React.createElement("span", { className: "text-muted-foreground text-xs" }, row.original.bed)
      ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "salary",
    header: "Salary",
    meta: { className: "text-right" },
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "font-semibold tabular-nums" },
        formatINR(invoices.find((i) => i.patientId === row.original.id)?.amount ?? 0)
      ),
  },
];

const CellBorderDemo = () =>
  React.createElement(DataTable as any, {
    columns: cellBorderColumns,
    data: patients,
    filterColumn: "name",
    filterPlaceholder: "Search patients...",
    cellBorder: true,
  });

// ─── Dense columns ────────────────────────────────────────────────────────────

const denseColumns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => patientCell(row.original.name, row.original.id),
  },
  {
    accessorKey: "ward",
    header: "Ward",
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "flex flex-col" },
        React.createElement("span", { className: "font-medium text-sm" }, row.original.ward),
        React.createElement("span", { className: "text-muted-foreground text-xs" }, row.original.bed)
      ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "tabular-nums text-sm" },
        `${row.original.age}y ${row.original.gender}`
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: patientStatusVariant[row.getValue("status") as Patient["status"]] },
        row.getValue("status")
      ),
  },
];

const DenseDemo = () =>
  React.createElement(DataTable as any, {
    columns: denseColumns,
    data: patients,
    filterColumn: "name",
    filterPlaceholder: "Search patients...",
    dense: true,
  });

// ─── Auto-width columns ───────────────────────────────────────────────────────

const autoWidthColumns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(Avatar, { shape: "rounded", size: "sm" },
          React.createElement(AvatarFallback, { color: "primary" }, getInitials(row.original.name))
        ),
        React.createElement("span", { className: "font-medium whitespace-nowrap" }, row.original.name)
      ),
  },
  {
    accessorKey: "ward",
    header: "Ward / Bed",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "whitespace-nowrap text-sm" },
        `${row.original.ward} · ${row.original.bed}`
      ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "whitespace-nowrap" },
        row.original.diagnosis
      ),
  },
  {
    id: "age",
    header: "Age",
    cell: ({ row }) =>
      React.createElement(
        "span",
        { className: "tabular-nums text-sm whitespace-nowrap" },
        `${row.original.age}y ${row.original.gender}`
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: patientStatusVariant[row.getValue("status") as Patient["status"]] },
        row.getValue("status")
      ),
  },
];

const AutoWidthDemo = () =>
  React.createElement(DataTable as any, {
    columns: autoWidthColumns,
    data: patients,
    filterColumn: "name",
    filterPlaceholder: "Search patients...",
    autoWidth: true,
  });

// ─── Expandable row data & columns ───────────────────────────────────────────

type ExpandablePatient = Patient & { notes: string };

const expandablePatients: ExpandablePatient[] = [
  { ...patients[0], notes: "BP well-controlled on current regime. Review amlodipine dose at next visit. Low-sodium diet advised." },
  { ...patients[1], notes: "Post-caesarean recovery progressing normally. Wound site clean. Mobilising with support. Breastfeeding established." },
  { ...patients[2], notes: "Cardiac monitoring in progress. Troponin trending down. Echocardiogram scheduled for tomorrow. Family counselled." },
  { ...patients[3], notes: "Post-appendicectomy Day 2. Bowel sounds present. IV antibiotics continuing. Drain output minimal." },
  { ...patients[4], notes: "HbA1c 8.4% on admission. Metformin dose adjusted. Dietician referral placed. Foot exam normal." },
  { ...patients[5], notes: "COPD exacerbation responding to nebulisation. Sputum sent for culture. SpO₂ stable at 94% on 2L O₂." },
  { ...patients[6], notes: "Laparoscopic cholecystectomy completed without complications. Tolerating clear fluids. Discharge planned for Day 3." },
  { ...patients[7], notes: "Typhoid confirmed on Widal test. Ceftriaxone IV initiated. Fever settling. Oral intake improving gradually." },
  { ...patients[8], notes: "Large ischaemic stroke confirmed on MRI. Thrombolysis given within window. Physio and SALT assessment ongoing." },
  { ...patients[9], notes: "Normal vaginal delivery at 39 weeks. Mother and baby well. Discharged on day 2 post-partum." },
  { ...patients[10], notes: "Total hip replacement Day 3. Physio commenced. DVT prophylaxis in place. Wound dry and intact." },
  { ...patients[11], notes: "UTI responding to oral ciprofloxacin. Urine culture sensitivity confirmed. Symptoms improving." },
];

const expandableColumns: ColumnDef<ExpandablePatient>[] = [
  {
    id: "expand",
    enableHiding: false,
    meta: { className: "w-0" },
    header: () => null,
    cell: ({ row }) =>
      React.createElement(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "size-7 text-muted-foreground",
          onClick: row.getToggleExpandedHandler(),
          "aria-label": row.getIsExpanded() ? "Collapse row" : "Expand row",
        } as any,
        row.getIsExpanded()
          ? React.createElement(ChevronUp, { className: "size-4" })
          : React.createElement(ChevronDown, { className: "size-4" })
      ),
  },
  {
    id: "patient",
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => patientCell(row.original.name, row.original.id),
  },
  {
    id: "location",
    header: "Ward / Bed",
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "flex flex-col" },
        React.createElement("span", { className: "font-medium text-sm" }, row.original.ward),
        React.createElement("span", { className: "text-muted-foreground text-xs" }, row.original.bed)
      ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: patientStatusVariant[row.getValue("status") as Patient["status"]] },
        row.getValue("status")
      ),
  },
];

const renderExpandedPatientRow = (row: Row<ExpandablePatient>) =>
  React.createElement(
    "div",
    { className: "flex items-start gap-2 border-t bg-muted/30 px-4 py-3" },
    React.createElement("span", { className: "mt-0.5 shrink-0 text-xs font-medium text-muted-foreground uppercase tracking-wide" }, "Clinical Notes:"),
    React.createElement("p", { className: "text-sm text-foreground" }, row.original.notes)
  );

const ExpandableRowDemo = () =>
  React.createElement(DataTable as any, {
    columns: expandableColumns,
    data: expandablePatients,
    filterColumn: "name",
    filterPlaceholder: "Search patients...",
    renderExpandedRow: renderExpandedPatientRow,
  });

// ─── Sub Data Grid — types & data ─────────────────────────────────────────────

type Investigation = {
  id: string;
  test: string;
  category: "Haematology" | "Biochemistry" | "Microbiology" | "Imaging";
  result: string;
  referenceRange: string;
  status: "normal" | "abnormal" | "critical";
};

type PatientEncounter = {
  id: string;
  patientId: string;
  patientName: string;
  ward: string;
  diagnosis: string;
  admittedOn: string;
  encounterStatus: "admitted" | "critical" | "stable" | "discharged";
  investigations: Investigation[];
};

const investigationStatusVariant: Record<Investigation["status"], "success" | "warning" | "destructive"> = {
  normal:   "success",
  abnormal: "warning",
  critical: "destructive",
};

const patientEncounters: PatientEncounter[] = [
  {
    id: "ENC-001", patientId: "OHC-0041", patientName: "Ravi Kumar",
    ward: "General", diagnosis: "Hypertension", admittedOn: "10 Apr 2026", encounterStatus: "stable",
    investigations: [
      { id: "E1-I1", test: "Complete Blood Count",  category: "Haematology",  result: "Normal",        referenceRange: "Varies",             status: "normal"   },
      { id: "E1-I2", test: "Serum Creatinine",      category: "Biochemistry", result: "98 µmol/L",     referenceRange: "62–115 µmol/L",      status: "normal"   },
      { id: "E1-I3", test: "Fasting Blood Glucose", category: "Biochemistry", result: "6.2 mmol/L",    referenceRange: "3.9–6.1 mmol/L",     status: "abnormal" },
    ],
  },
  {
    id: "ENC-002", patientId: "OHC-0043", patientName: "Arjun Mehta",
    ward: "ICU", diagnosis: "Cardiac arrest", admittedOn: "13 Apr 2026", encounterStatus: "critical",
    investigations: [
      { id: "E2-I1", test: "Troponin I",            category: "Biochemistry", result: "4.8 µg/L",           referenceRange: "< 0.04 µg/L",        status: "critical" },
      { id: "E2-I2", test: "ECG",                   category: "Imaging",      result: "ST elevation V1–V4", referenceRange: "Normal sinus rhythm", status: "critical" },
      { id: "E2-I3", test: "CK-MB",                 category: "Biochemistry", result: "62 U/L",             referenceRange: "< 25 U/L",           status: "critical" },
      { id: "E2-I4", test: "INR",                   category: "Haematology",  result: "1.1",                referenceRange: "0.8–1.2",            status: "normal"   },
      { id: "E2-I5", test: "Echocardiogram",        category: "Imaging",      result: "EF 35%",             referenceRange: "EF ≥ 55%",           status: "abnormal" },
    ],
  },
  {
    id: "ENC-003", patientId: "OHC-0044", patientName: "Sunita Rao",
    ward: "Surgical", diagnosis: "Appendicitis", admittedOn: "14 Apr 2026", encounterStatus: "admitted",
    investigations: [
      { id: "E3-I1", test: "WBC Count",             category: "Haematology",  result: "14.2 × 10⁹/L",  referenceRange: "4–11 × 10⁹/L",       status: "abnormal" },
      { id: "E3-I2", test: "C-Reactive Protein",    category: "Biochemistry", result: "88 mg/L",         referenceRange: "< 10 mg/L",          status: "critical" },
      { id: "E3-I3", test: "Ultrasound Abdomen",    category: "Imaging",      result: "Appendix 9mm",    referenceRange: "< 6 mm",             status: "abnormal" },
      { id: "E3-I4", test: "Urine Culture",         category: "Microbiology", result: "No growth",       referenceRange: "No growth",          status: "normal"   },
    ],
  },
  {
    id: "ENC-004", patientId: "OHC-0045", patientName: "Mohammed Ali",
    ward: "General", diagnosis: "Diabetes mellitus", admittedOn: "09 Apr 2026", encounterStatus: "stable",
    investigations: [
      { id: "E4-I1", test: "HbA1c",                 category: "Biochemistry", result: "8.4%",           referenceRange: "< 6.5%",             status: "abnormal" },
      { id: "E4-I2", test: "Fasting Blood Glucose", category: "Biochemistry", result: "9.8 mmol/L",     referenceRange: "3.9–6.1 mmol/L",     status: "critical" },
      { id: "E4-I3", test: "Urine Microalbumin",    category: "Biochemistry", result: "28 mg/L",        referenceRange: "< 20 mg/L",          status: "abnormal" },
    ],
  },
  {
    id: "ENC-005", patientId: "OHC-0049", patientName: "Deepak Verma",
    ward: "ICU", diagnosis: "Stroke", admittedOn: "13 Apr 2026", encounterStatus: "critical",
    investigations: [
      { id: "E5-I1", test: "CT Brain (plain)",      category: "Imaging",      result: "Ischaemic L MCA", referenceRange: "Normal",            status: "critical" },
      { id: "E5-I2", test: "INR",                   category: "Haematology",  result: "1.0",             referenceRange: "0.8–1.2",           status: "normal"   },
      { id: "E5-I3", test: "Serum Glucose",         category: "Biochemistry", result: "7.2 mmol/L",      referenceRange: "3.9–7.8 mmol/L",   status: "normal"   },
      { id: "E5-I4", test: "Blood Culture",         category: "Microbiology", result: "No growth",       referenceRange: "No growth",         status: "normal"   },
    ],
  },
  {
    id: "ENC-006", patientId: "OHC-0051", patientName: "Rajesh Nambiar",
    ward: "Orthopedic", diagnosis: "Hip replacement", admittedOn: "14 Apr 2026", encounterStatus: "admitted",
    investigations: [
      { id: "E6-I1", test: "X-Ray Hip (AP)",        category: "Imaging",      result: "Prosthesis in situ", referenceRange: "Post-op normal",  status: "normal"   },
      { id: "E6-I2", test: "Haemoglobin",           category: "Haematology",  result: "10.2 g/dL",       referenceRange: "13–17 g/dL",        status: "abnormal" },
      { id: "E6-I3", test: "D-Dimer",               category: "Haematology",  result: "0.6 mg/L FEU",    referenceRange: "< 0.5 mg/L FEU",   status: "abnormal" },
    ],
  },
];

// ─── Sub Data Grid — columns & components ─────────────────────────────────────

const investigationColumns: ColumnDef<Investigation>[] = [
  {
    accessorKey: "test",
    header: "Test",
    cell: ({ row }) => React.createElement("span", { className: "font-medium text-sm" }, row.getValue("test")),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => React.createElement(Badge, { variant: "neutral" }, row.getValue("category")),
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => React.createElement("span", { className: "tabular-nums text-sm font-medium" }, row.getValue("result")),
  },
  {
    accessorKey: "referenceRange",
    header: "Reference Range",
    cell: ({ row }) => React.createElement("span", { className: "text-muted-foreground text-sm" }, row.getValue("referenceRange")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: investigationStatusVariant[row.getValue("status") as Investigation["status"]] },
        row.getValue("status")
      ),
  },
];

const InvestigationSubTable = ({ investigations }: { investigations: Investigation[] }) =>
  React.createElement(DataTable as any, {
    columns: investigationColumns,
    data: investigations,
    hideToolbar: true,
  });

const encounterColumns: ColumnDef<PatientEncounter>[] = [
  {
    id: "expand",
    enableHiding: false,
    meta: { className: "w-0" },
    header: () => null,
    cell: ({ row }) =>
      React.createElement(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "size-7 text-muted-foreground",
          onClick: row.getToggleExpandedHandler(),
          "aria-label": row.getIsExpanded() ? "Collapse" : "Expand",
        } as any,
        row.getIsExpanded()
          ? React.createElement(ChevronUp, { className: "size-4" })
          : React.createElement(ChevronDown, { className: "size-4" })
      ),
  },
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => patientCell(row.original.patientName, row.original.patientId),
  },
  { accessorKey: "ward", header: "Ward" },
  { accessorKey: "diagnosis", header: "Diagnosis" },
  {
    accessorKey: "admittedOn",
    header: "Admitted",
    cell: ({ row }) => React.createElement("span", { className: "tabular-nums text-sm" }, row.getValue("admittedOn")),
  },
  {
    id: "investigations",
    header: "Tests",
    cell: ({ row }) =>
      React.createElement(Badge, { variant: "neutral" }, `${row.original.investigations.length} tests`),
  },
  {
    accessorKey: "encounterStatus",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: patientStatusVariant[row.getValue("encounterStatus") as Patient["status"]] },
        row.getValue("encounterStatus")
      ),
  },
];

const renderInvestigationSubTable = (row: Row<PatientEncounter>) =>
  React.createElement(
    "div",
    { className: "border-t bg-muted/20 px-4 py-4" },
    React.createElement(
      "p",
      { className: "mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground" },
      `Investigations — ${row.original.patientName}`
    ),
    React.createElement(InvestigationSubTable, { investigations: row.original.investigations })
  );

const SubDataGridDemo = () =>
  React.createElement(DataTable as any, {
    columns: encounterColumns,
    data: patientEncounters,
    filterColumn: "patientName",
    filterPlaceholder: "Search patients...",
    renderExpandedRow: renderInvestigationSubTable,
  });

// ─── Footer rows data & columns ───────────────────────────────────────────────

const footerInvoiceColumns: ColumnDef<Invoice>[] = [
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    footer: () => React.createElement("span", { className: "font-semibold" }, "Total"),
    cell: ({ row }) => patientCell(row.original.patientName, row.original.patientId),
  },
  {
    accessorKey: "date",
    header: "Date",
    footer: () => null,
  },
  {
    accessorKey: "category",
    header: "Category",
    footer: () => null,
    cell: ({ row }) => React.createElement(Badge, { variant: "neutral" }, row.getValue("category")),
  },
  {
    accessorKey: "amount",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, { column: column as any, title: "Amount" }),
    footer: ({ table }) => {
      const total = table
        .getFilteredRowModel()
        .rows.reduce((sum, row) => sum + (row.getValue("amount") as number), 0);
      return React.createElement(
        "span",
        { className: "font-semibold tabular-nums" },
        formatINR(total)
      );
    },
    meta: { className: "text-right" },
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "font-medium tabular-nums" },
        formatINR(row.getValue("amount"))
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    footer: () => null,
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: invoiceStatusVariant[row.getValue("status") as Invoice["status"]] },
        row.getValue("status")
      ),
  },
];

const FooterRowsDemo = () =>
  React.createElement(DataTable as any, {
    columns: footerInvoiceColumns,
    data: invoices,
    filterColumn: "patientName",
    filterPlaceholder: "Search by patient...",
  });

// ─── Column Icons columns ────────────────────────────────────────────────────────

const columnIconColumns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Patient",
        icon: React.createElement(User),
      }),
    cell: ({ row }) => patientCell(row.original.name, row.original.id),
  },
  {
    accessorKey: "ward",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Ward / Bed",
        icon: React.createElement(MapPin),
      }),
    cell: ({ row }) =>
      React.createElement(
        "div",
        { className: "flex flex-col" },
        React.createElement("span", { className: "font-medium text-sm" }, row.original.ward),
        React.createElement("span", { className: "text-muted-foreground text-xs" }, row.original.bed)
      ),
  },
  {
    accessorKey: "diagnosis",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Diagnosis",
        icon: React.createElement(Stethoscope),
      }),
  },
  {
    accessorKey: "status",
    header: ({ column }) =>
      React.createElement(DataTableColumnHeader, {
        column: column as any,
        title: "Status",
        icon: React.createElement(HeartPulse),
      }),
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: patientStatusVariant[row.getValue("status") as Patient["status"]] },
        row.getValue("status")
      ),
  },
];

const ColumnIconsDemo = () =>
  React.createElement(DataTable as any, {
    columns: columnIconColumns,
    data: patients,
    filterColumn: "name",
    filterPlaceholder: "Search patients...",
  });

// ─── Row Pinning demo ─────────────────────────────────────────────────────────

const rowPinColumns: ColumnDef<Patient>[] = [
  {
    id: "pin",
    enableHiding: false,
    meta: { className: "w-0" },
    header: () => null,
    cell: ({ row }) => {
      const isPinned = row.getIsPinned() === "top";
      return React.createElement(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: `size-7 ${isPinned ? "text-primary" : "text-muted-foreground"}`,
          onClick: () => row.pin(isPinned ? false : "top"),
          "aria-label": isPinned ? "Unpin row" : "Pin row to top",
        } as any,
        isPinned
          ? React.createElement(PinOff, { className: "size-4" })
          : React.createElement(Pin, { className: "size-4" })
      );
    },
  },
  {
    id: "patient",
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => patientCell(row.original.name, row.original.id),
  },
  { accessorKey: "ward", header: "Ward" },
  { accessorKey: "diagnosis", header: "Diagnosis" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      React.createElement(
        Badge,
        { variant: patientStatusVariant[row.getValue("status") as Patient["status"]] },
        row.getValue("status")
      ),
  },
];

function RowPinningDemo() {
  const [rowPinning, setRowPinning] = React.useState<RowPinningState>({ top: [], bottom: [] });
  const [globalFilter, setGlobalFilter] = React.useState("");

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: patients,
    columns: rowPinColumns,
    state: { rowPinning, globalFilter },
    onRowPinningChange: setRowPinning,
    onGlobalFilterChange: setGlobalFilter,
    enableRowPinning: true,
    keepPinnedRows: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pinnedRows = table.getTopRows();
  const unpinnedRows = table.getCenterRows();

  return React.createElement(
    "div",
    { className: "w-full space-y-0" },
    React.createElement(
      "div",
      { className: "flex items-center gap-2 py-4" },
      React.createElement("input", {
        placeholder: "Search patients...",
        value: globalFilter,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value),
        className: "max-w-sm h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      })
    ),
    React.createElement(
      "div",
      { className: "overflow-hidden rounded-md border" },
      React.createElement(
        Table,
        null,
        React.createElement(
          TableHeader,
          null,
          table.getHeaderGroups().map((hg) =>
            React.createElement(
              TableRow,
              { key: hg.id },
              hg.headers.map((header) =>
                React.createElement(
                  TableHead,
                  { key: header.id, className: header.column.columnDef.meta?.className },
                  header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())
                )
              )
            )
          )
        ),
        React.createElement(
          TableBody,
          null,
          pinnedRows.length > 0 &&
            pinnedRows.map((row) =>
              React.createElement(
                TableRow,
                { key: row.id, className: "bg-primary/5 font-medium sticky top-0 z-10" },
                row.getVisibleCells().map((cell) =>
                  React.createElement(
                    TableCell,
                    { key: cell.id, className: cell.column.columnDef.meta?.className },
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )
                )
              )
            ),
          unpinnedRows.length > 0
            ? unpinnedRows.map((row) =>
                React.createElement(
                  TableRow,
                  { key: row.id },
                  row.getVisibleCells().map((cell) =>
                    React.createElement(
                      TableCell,
                      { key: cell.id, className: cell.column.columnDef.meta?.className },
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )
                  )
                )
              )
            : React.createElement(
                TableRow,
                null,
                React.createElement(
                  TableCell,
                  { colSpan: rowPinColumns.length, className: "h-24 text-center" },
                  "No results."
                )
              )
        )
      )
    )
  );
}

// ─── ComponentDoc ─────────────────────────────────────────────────────────────

export const dataTableDoc: ComponentDoc = {
  id: "data-table",
  name: "Data Table",
  description:
    "Powerful table and datagrids built using TanStack Table. Supports sorting, filtering, pagination, column visibility, and row selection.",
  installation: {
    cli: "npx shadcn@latest add table",
    manual:
      "Install @tanstack/react-table, add the Table component, then copy the DataTable component into your project.",
  },
  usage: `import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

type Patient = {
  id: string
  name: string
  age: number
  ward: string
  diagnosis: string
  status: "admitted" | "critical" | "stable" | "discharged"
}

const columns: ColumnDef<Patient>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "ward", header: "Ward" },
  { accessorKey: "diagnosis", header: "Diagnosis" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariantMap[row.getValue("status")]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function PatientListPage() {
  return <DataTable columns={columns} data={patients} filterColumn="name" />
}`,
  preview: {
    code: `"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type Patient = {
  id: string      // "OHC-0041"
  name: string
  age: number
  gender: "M" | "F"
  ward: string
  bed: string
  diagnosis: string
  status: "admitted" | "critical" | "stable" | "discharged"
}

const patientStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

export const columns: ColumnDef<Patient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "patient",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    id: "demographics",,
    header: "Age / Gender",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.age}y {row.original.gender}
      </span>
    ),
  },
  {
    id: "location",
    header: "Ward / Bed",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.ward}</span>
        <span className="text-muted-foreground text-xs">{row.original.bed}</span>
      </div>
    ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={patientStatusVariant[row.getValue("status") as Patient["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    meta: { className: "w-0" },
    cell: ({ row }) => (
      <DataTableRowActions>
        <DropdownMenuItem>View record</DropdownMenuItem>
        <DropdownMenuItem>Edit details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Add note</DropdownMenuItem>
        <DropdownMenuItem>Prescribe medication</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Discharge patient</DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
]

export function PatientListDemo() {
  return (
    <DataTable
      columns={columns}
      data={patients}
      filterColumn="name"
      filterPlaceholder="Search patients..."
    />
  )
}`,
    component: React.createElement(PatientTableDemo),
  },
  examples: [
    {
      name: "Medication Administration",
      description:
        "Medication Administration Record (MAR) showing scheduled drugs, dose, route, and administration status for inpatients.",
      code: `"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type ColumnDef } from "@tanstack/react-table"

type MedLog = {
  id: string
  patientId: string
  patientName: string
  medication: string
  dose: string
  route: string
  scheduledAt: string
  status: "given" | "pending" | "missed"
}

const statusVariant = {
  given:   "success",
  pending: "warning",
  missed:  "destructive",
} as const

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const columns: ColumnDef<MedLog>[] = [
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.patientName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.patientName}</span>
          <span className="text-muted-foreground text-xs">{row.original.patientId}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "medication",
    header: "Medication",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.medication}</span>
        <span className="text-muted-foreground text-xs">
          {row.original.dose} · {row.original.route}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "scheduledAt",
    header: "Scheduled",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-sm">{row.getValue("scheduledAt")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.getValue("status") as MedLog["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function MedicationAdministrationTable() {
  return (
    <DataTable
      columns={columns}
      data={medLogs}
      filterColumn="patientName"
      filterPlaceholder="Search by patient..."
    />
  )
}`,
      preview: React.createElement(MedLogDemo),
    },
    {
      name: "Invoices",
      description:
        "Billing and invoice management with sortable amounts, category badges, payment status, and row-level actions.",
      code: `"use client"

import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { type ColumnDef } from "@tanstack/react-table"

type Invoice = {
  id: string
  patientName: string
  patientId: string
  date: string
  category: string
  amount: number
  status: "paid" | "pending" | "overdue"
}

const statusVariant = {
  paid:    "success",
  pending: "warning",
  overdue: "destructive",
} as const

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice #" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue("id")}</span>
    ),
  },
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.patientName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.patientName}</span>
          <span className="text-muted-foreground text-xs">{row.original.patientId}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <Badge variant="neutral">{row.getValue("category")}</Badge>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <div className="font-medium tabular-nums">{formatINR(row.getValue("amount"))}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.getValue("status") as Invoice["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    meta: { className: "w-0" },
    cell: ({ row }) => (
      <DataTableRowActions>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(row.original.id)}
        >
          Copy invoice ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View invoice</DropdownMenuItem>
        <DropdownMenuItem>Download PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Mark as paid</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">Void invoice</DropdownMenuItem>
      </DataTableRowActions>
    ),
  },
]

export function InvoiceTable() {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      filterColumn="patientName"
      filterPlaceholder="Search by patient..."
    />
  )
}`,
      preview: React.createElement(InvoiceDemo),
    },
    {
      name: "Sortable Columns",
      description:
        "Staff directory with sortable name, department, designation, and experience columns. Click any column header to toggle ascending / descending order.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

type StaffMember = {
  id: string
  name: string
  email: string
  department: string
  designation: string
  joined: string
  experience: number
  status: "active" | "inactive"
}

const staffMembers: StaffMember[] = [
  { id: "STAFF-001", name: "Dr. Kiran Reddy",       email: "kiran.reddy@ohc.in",    department: "Cardiology",       designation: "Senior Consultant",  joined: "Jan 2018", experience: 12, status: "active"   },
  { id: "STAFF-002", name: "Dr. Anita Menon",        email: "anita.menon@ohc.in",    department: "Pediatrics",       designation: "Consultant",          joined: "Mar 2020", experience:  8, status: "active"   },
  { id: "STAFF-003", name: "Dr. Suresh Pillai",      email: "suresh.pillai@ohc.in",  department: "Surgery",          designation: "Head of Department",  joined: "Jun 2015", experience: 15, status: "active"   },
  { id: "STAFF-004", name: "Nurse Rekha Thomas",     email: "rekha.thomas@ohc.in",   department: "ICU",              designation: "Senior Nurse",        joined: "Sep 2019", experience:  6, status: "inactive" },
  { id: "STAFF-005", name: "Dr. Imran Sheikh",       email: "imran.sheikh@ohc.in",   department: "Orthopedics",      designation: "Consultant",          joined: "Nov 2017", experience: 10, status: "active"   },
  { id: "STAFF-006", name: "Nurse Preethi Sajan",    email: "preethi.sajan@ohc.in",  department: "General Medicine", designation: "Staff Nurse",         joined: "Feb 2022", experience:  3, status: "active"   },
  { id: "STAFF-007", name: "Dr. Kavitha Nair",       email: "kavitha.nair@ohc.in",   department: "Neurology",        designation: "Senior Consultant",  joined: "Aug 2016", experience: 14, status: "active"   },
  { id: "STAFF-008", name: "Dr. Rajiv Kapoor",       email: "rajiv.kapoor@ohc.in",   department: "Radiology",        designation: "Consultant",          joined: "Dec 2021", experience:  5, status: "inactive" },
  { id: "STAFF-009", name: "Nurse Sumathi Krishnan", email: "sumathi.k@ohc.in",      department: "Maternity",        designation: "Senior Nurse",        joined: "Apr 2018", experience:  9, status: "active"   },
  { id: "STAFF-010", name: "Dr. Farhan Hossain",     email: "farhan.hossain@ohc.in", department: "Oncology",         designation: "Consultant",          joined: "Jul 2020", experience:  7, status: "active"   },
  { id: "STAFF-011", name: "Dr. Pooja Iyer",         email: "pooja.iyer@ohc.in",     department: "Dermatology",      designation: "Consultant",          joined: "May 2023", experience:  4, status: "active"   },
  { id: "STAFF-012", name: "Nurse Arun Mathew",      email: "arun.mathew@ohc.in",    department: "Emergency",        designation: "Charge Nurse",        joined: "Oct 2019", experience:  6, status: "inactive" },
]

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const columns: ColumnDef<StaffMember>[] = [
  {
    id: "staff",
    accessorKey: "name",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Staff" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="circle">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
  },
  {
    accessorKey: "designation",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Designation" />,
  },
  {
    accessorKey: "experience",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Experience" />,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue("experience")} yrs</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "active" ? "success" : "neutral"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function SortableStaffTable() {
  return (
    <DataTable
      columns={columns}
      data={staffMembers}
      filterColumn="name"
      filterPlaceholder="Search staff..."
    />
  )
}`,

      preview: React.createElement(SortablePatientDemo),
    },
    {
      name: "Movable Columns",
      description:
        "Drag any column header left or right to reorder columns on the fly. Powered by the TanStack Table `columnOrder` state and native HTML5 drag-and-drop — no extra dependencies required.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

type StaffMember = {
  id: string
  name: string
  email: string
  department: string
  designation: string
  joined: string
  experience: number
  status: "active" | "inactive"
}

const staffMembers: StaffMember[] = [
  { id: "STAFF-001", name: "Dr. Kiran Reddy",       email: "kiran.reddy@ohc.in",    department: "Cardiology",       designation: "Senior Consultant", joined: "Jan 2018", experience: 12, status: "active"   },
  { id: "STAFF-002", name: "Dr. Anita Menon",        email: "anita.menon@ohc.in",    department: "Pediatrics",       designation: "Consultant",         joined: "Mar 2020", experience:  8, status: "active"   },
  { id: "STAFF-003", name: "Dr. Suresh Pillai",      email: "suresh.pillai@ohc.in",  department: "Surgery",          designation: "Head of Department", joined: "Jun 2015", experience: 15, status: "active"   },
  { id: "STAFF-004", name: "Nurse Rekha Thomas",     email: "rekha.thomas@ohc.in",   department: "ICU",              designation: "Senior Nurse",       joined: "Sep 2019", experience:  6, status: "inactive" },
  { id: "STAFF-005", name: "Dr. Imran Sheikh",       email: "imran.sheikh@ohc.in",   department: "Orthopedics",      designation: "Consultant",         joined: "Nov 2017", experience: 10, status: "active"   },
  { id: "STAFF-006", name: "Nurse Preethi Sajan",    email: "preethi.sajan@ohc.in",  department: "General Medicine", designation: "Staff Nurse",        joined: "Feb 2022", experience:  3, status: "active"   },
  { id: "STAFF-007", name: "Dr. Kavitha Nair",       email: "kavitha.nair@ohc.in",   department: "Neurology",        designation: "Senior Consultant", joined: "Aug 2016", experience: 14, status: "active"   },
  { id: "STAFF-008", name: "Dr. Rajiv Kapoor",       email: "rajiv.kapoor@ohc.in",   department: "Radiology",        designation: "Consultant",         joined: "Dec 2021", experience:  5, status: "inactive" },
  { id: "STAFF-009", name: "Nurse Sumathi Krishnan", email: "sumathi.k@ohc.in",      department: "Maternity",        designation: "Senior Nurse",       joined: "Apr 2018", experience:  9, status: "active"   },
  { id: "STAFF-010", name: "Dr. Farhan Hossain",     email: "farhan.hossain@ohc.in", department: "Oncology",         designation: "Consultant",         joined: "Jul 2020", experience:  7, status: "active"   },
  { id: "STAFF-011", name: "Dr. Pooja Iyer",         email: "pooja.iyer@ohc.in",     department: "Dermatology",      designation: "Consultant",         joined: "May 2023", experience:  4, status: "active"   },
  { id: "STAFF-012", name: "Nurse Arun Mathew",      email: "arun.mathew@ohc.in",    department: "Emergency",        designation: "Charge Nurse",       joined: "Oct 2019", experience:  6, status: "inactive" },
]

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const columns: ColumnDef<StaffMember>[] = [
  {
    id: "staff",
    accessorKey: "name",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Staff" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="circle">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
  },
  {
    accessorKey: "designation",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Designation" />,
  },
  {
    accessorKey: "experience",
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Experience" />,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue("experience")} yrs</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "active" ? "success" : "neutral"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function MovableStaffTable() {
  return (
    <DataTable
      columns={columns}
      data={staffMembers}
      filterColumn="name"
      filterPlaceholder="Search staff..."
      movableColumns
    />
  )
}`,
      preview: React.createElement(MovableColumnsDemo),
    },
    {
      name: "Draggable Columns",
      description:
        "Drag column headers to reorder them using @dnd-kit. Each header shows a grip handle that users can grab to move columns left or right.",
      code: `"use client"

import React, { useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import {
  type ColumnDef,
  type Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { GripVertical } from "lucide-react"

type Member = {
  id: string
  name: string
  avatar: string
  email: string
  company: string
  role: string
  status: "active" | "inactive"
}

const members: Member[] = [
  { id: "1",  name: "Alex Johnson",      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80", email: "alex@apple.com",    company: "Apple",      role: "CEO",             status: "active"   },
  { id: "2",  name: "Sarah Chen",        avatar: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80", email: "sarah@openai.com",  company: "OpenAI",     role: "CTO",             status: "inactive" },
  { id: "3",  name: "Michael Rodriguez", avatar: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80", email: "michael@meta.com",  company: "Meta",       role: "Designer",        status: "active"   },
  { id: "4",  name: "Emma Wilson",       avatar: "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80", email: "emma@tesla.com",    company: "Tesla",      role: "Developer",       status: "inactive" },
  { id: "5",  name: "David Kim",         avatar: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80", email: "david@sap.com",     company: "SAP",        role: "Lawyer",          status: "inactive" },
  { id: "6",  name: "Aron Thompson",     avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80", email: "aron@keen.com",     company: "Keenthemes", role: "Director",        status: "active"   },
  { id: "7",  name: "James Brown",       avatar: "https://images.unsplash.com/photo-1543299750-19d1d6297053?w=96&h=96&dpr=2&q=80", email: "james@bbva.es",     company: "BBVA",       role: "Product Manager", status: "inactive" },
  { id: "8",  name: "Maria Garcia",      avatar: "https://images.unsplash.com/photo-1620075225255-8c2051b6c015?w=96&h=96&dpr=2&q=80", email: "maria@sony.jp",     company: "Sony",       role: "Marketing Lead",  status: "inactive" },
  { id: "9",  name: "Nick Johnson",      avatar: "https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?w=96&h=96&dpr=2&q=80", email: "nick@lvmh.fr",      company: "LVMH",       role: "Data Scientist",  status: "inactive" },
  { id: "10", name: "Liam Thompson",     avatar: "https://images.unsplash.com/photo-1542595913-85d69b0edbaf?w=96&h=96&dpr=2&q=80", email: "liam@eni.it",       company: "ENI",        role: "Engineer",        status: "inactive" },
  { id: "11", name: "Pooja Iyer",        avatar: "https://images.unsplash.com/photo-1619946794135-5bc917a27793?w=96&h=96&dpr=2&q=80", email: "pooja@tata.in",     company: "Tata",       role: "Sales Manager",   status: "active"   },
]

const columns: ColumnDef<Member>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="circle">
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{row.original.name}</span>
      </div>
    ),
  },
  { id: "email",   accessorKey: "email",   header: "Email",      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.email}</span> },
  { id: "company", accessorKey: "company", header: "Company",    cell: ({ row }) => <span className="font-medium text-sm">{row.original.company}</span> },
  { id: "role",    accessorKey: "role",    header: "Occupation", cell: ({ row }) => <span className="text-sm">{row.original.role}</span> },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status === "active"
        ? <Badge variant="success">Approved</Badge>
        : <Badge variant="warning">Pending</Badge>,
  },
]

function SortableColumnHeader({
  header,
  transform,
  isDragging,
  noTransition,
  onRef,
}: {
  header: Header<Member, unknown>
  transform: number
  isDragging: boolean
  noTransition: boolean
  onRef: (el: HTMLElement | null) => void
}) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: header.id })
  return (
    <TableHead
      ref={(el) => { setNodeRef(el); onRef(el) }}
      colSpan={header.colSpan}
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: transform !== 0 ? \`translateX(\${transform}px)\` : undefined,
        position: transform !== 0 || isDragging ? "relative" : undefined,
        zIndex: isDragging ? 10 : undefined,
        transition: (isDragging || noTransition) ? "none" : "transform 100ms ease",
      }}
    >
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder column"
        >
          <GripVertical className="size-3.5" />
        </button>
        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </TableHead>
  )
}

export function DraggableColumnsTable() {
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((c) => c.id as string)
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [activeDelta, setActiveDelta] = useState(0)
  const [noTransition, setNoTransition] = useState(false)
  const headerRefs = useRef<Record<string, HTMLElement | null>>({})

  const displacements = useMemo<Record<string, number>>(() => {
    if (!activeId || !overId) return {}
    const activeIdx = columnOrder.indexOf(activeId)
    const overIdx = columnOrder.indexOf(overId)
    if (activeIdx === overIdx) return {}
    const activeWidth = headerRefs.current[activeId]?.offsetWidth ?? 0
    const result: Record<string, number> = {}
    for (const id of columnOrder) {
      if (id === activeId) continue
      const idx = columnOrder.indexOf(id)
      if (activeIdx < overIdx && idx > activeIdx && idx <= overIdx)
        result[id] = -activeWidth
      else if (activeIdx > overIdx && idx < activeIdx && idx >= overIdx)
        result[id] = activeWidth
    }
    return result
  }, [activeId, overId, columnOrder])

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setNoTransition(true)
    if (active && over && active.id !== over.id) {
      setColumnOrder((order) => {
        const oldIdx = order.indexOf(active.id as string)
        const newIdx = order.indexOf(over.id as string)
        return arrayMove(order, oldIdx, newIdx)
      })
    }
    setActiveId(null)
    setOverId(null)
    setActiveDelta(0)
    requestAnimationFrame(() => setNoTransition(false))
  }

  const table = useReactTable({
    data: members,
    columns,
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => { setActiveId(active.id as string); setOverId(active.id as string); setActiveDelta(0) }}
      onDragMove={({ delta }) => setActiveDelta(delta.x)}
      onDragOver={({ over }) => setOverId(over?.id as string ?? null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setNoTransition(true); setActiveId(null); setOverId(null); setActiveDelta(0); requestAnimationFrame(() => setNoTransition(false)) }}
    >
      <div className="overflow-hidden rounded-md border [&_td:not(:last-child)]:border-r [&_th:not(:last-child)]:border-r">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map((header) => (
                    <SortableColumnHeader
                      key={header.id}
                      header={header}
                      transform={activeId === header.id ? activeDelta : (displacements[header.id] ?? 0)}
                      isDragging={activeId === header.id}
                      noTransition={noTransition}
                      onRef={(el) => { headerRefs.current[header.id] = el }}
                    />
                  ))}
                </SortableContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const dragging = activeId === cell.column.id
                  const tx = dragging ? activeDelta : (displacements[cell.column.id] ?? 0)
                  return (
                    <TableCell
                      key={cell.id}
                      style={tx !== 0 || dragging ? {
                        transform: \`translateX(\${tx}px)\`,
                        position: "relative",
                        zIndex: dragging ? 10 : undefined,
                        opacity: dragging ? 0.6 : 1,
                        transition: (dragging || noTransition) ? "none" : "transform 100ms ease",
                      } : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  )
}`,
      preview: React.createElement(DraggableColumnsDemo),
    },
    {
      name: "Cell Border",
      description:
        "Adds vertical borders between columns for a spreadsheet-like grid feel — useful for dense financial or clinical data tables.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const patientStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const columns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "ward",
    header: "Ward",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.ward}</span>
        <span className="text-muted-foreground text-xs">{row.original.bed}</span>
      </div>
    ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "amount",
    header: "Invoice",
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">
        {formatINR(row.original.amount)}
      </span>
    ),
  },
]

export function CellBorderTable() {
  return (
    <DataTable
      columns={columns}
      data={patients}
      filterColumn="name"
      filterPlaceholder="Search patients..."
      cellBorder
    />
  )
}`,
      preview: React.createElement(CellBorderDemo),
    },
    {
      name: "Dense Table",
      description:
        "Compact row padding for high-density clinical views like vitals logs, lab results, or medication schedules where many rows need to be visible at once.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const patientStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const columns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "ward",
    header: "Ward",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.ward}</span>
        <span className="text-muted-foreground text-xs">{row.original.bed}</span>
      </div>
    ),
  },
  { accessorKey: "diagnosis", header: "Diagnosis" },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {row.original.age}y {row.original.gender}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={patientStatusVariant[row.getValue("status") as Patient["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function DensePatientTable() {
  return (
    <DataTable
      columns={columns}
      data={patients}
      filterColumn="name"
      filterPlaceholder="Search patients..."
      dense
    />
  )
}`,
      preview: React.createElement(DenseDemo),
    },
    {
      name: "Auto Width",
      description:
        "Table columns size to their content instead of stretching to fill the container — ideal for compact reference tables where consistent column widths are not needed.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const patientStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const columns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar shape="rounded" size="sm">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium whitespace-nowrap">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "ward",
    header: "Ward / Bed",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {row.original.ward} · {row.original.bed}
      </span>
    ),
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{row.original.diagnosis}</span>
    ),
  },
  {
    id: "age",
    header: "Age",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm whitespace-nowrap">
        {row.original.age}y {row.original.gender}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={patientStatusVariant[row.getValue("status") as Patient["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function AutoWidthPatientTable() {
  return (
    <DataTable
      columns={columns}
      data={patients}
      filterColumn="name"
      filterPlaceholder="Search patients..."
      autoWidth
    />
  )
}`,
      preview: React.createElement(AutoWidthDemo),
    },
    {
      name: "Expandable Rows",
      description:
        "Rows expand inline to reveal additional detail — clinical notes, medications, or test results — without navigating away. Add a toggle column with row.getToggleExpandedHandler() and pass renderExpandedRow to DataTable.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef, type Row } from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"

type Patient = {
  id: string
  name: string
  age: number
  gender: "M" | "F"
  ward: string
  bed: string
  diagnosis: string
  status: "admitted" | "critical" | "stable" | "discharged"
  notes: string
}

const patientStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const columns: ColumnDef<Patient>[] = [
  {
    id: "expand",
    enableHiding: false,
    meta: { className: "w-0" },
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground"
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
      >
        {row.getIsExpanded()
          ? <ChevronUp className="size-4" />
          : <ChevronDown className="size-4" />}
      </Button>
    ),
  },
  {
    id: "patient",
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    id: "location",
    header: "Ward / Bed",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.ward}</span>
        <span className="text-muted-foreground text-xs">{row.original.bed}</span>
      </div>
    ),
  },
  { accessorKey: "diagnosis", header: "Diagnosis" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={patientStatusVariant[row.getValue("status") as Patient["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

function renderExpandedRow(row: Row<Patient>) {
  return (
    <div className="flex items-start gap-2 border-t bg-muted/30 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Clinical Notes:
      </span>
      <p className="text-sm text-foreground">{row.original.notes}</p>
    </div>
  )
}

export function ExpandablePatientTable() {
  return (
    <DataTable
      columns={columns}
      data={patients}
      filterColumn="name"
      filterPlaceholder="Search patients..."
      renderExpandedRow={renderExpandedRow}
    />
  )
}`,
      preview: React.createElement(ExpandableRowDemo),
    },
    {
      name: "Sub Data Grid",
      description:
        "Expandable rows that reveal a fully functional nested DataTable — useful for master/detail views like patient encounters with lab investigations, orders with line items, or wards with bed assignments.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef, type Row } from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"

type Investigation = {
  id: string
  test: string
  category: string
  result: string
  referenceRange: string
  status: "normal" | "abnormal" | "critical"
}

type PatientEncounter = {
  id: string
  patientId: string
  patientName: string
  ward: string
  diagnosis: string
  admittedOn: string
  encounterStatus: "admitted" | "critical" | "stable" | "discharged"
  investigations: Investigation[]
}

const investigationStatusVariant = {
  normal:   "success",
  abnormal: "warning",
  critical: "destructive",
} as const

const encounterStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const investigationColumns: ColumnDef<Investigation>[] = [
  {
    accessorKey: "test",
    header: "Test",
    cell: ({ row }) => <span className="font-medium text-sm">{row.getValue("test")}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <Badge variant="neutral">{row.getValue("category")}</Badge>,
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => <span className="tabular-nums text-sm font-medium">{row.getValue("result")}</span>,
  },
  {
    accessorKey: "referenceRange",
    header: "Reference Range",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.getValue("referenceRange")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={investigationStatusVariant[row.getValue("status") as Investigation["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

function InvestigationSubTable({ investigations }: { investigations: Investigation[] }) {
  return (
    <DataTable
      columns={investigationColumns}
      data={investigations}
      hideToolbar
    />
  )
}

const encounterColumns: ColumnDef<PatientEncounter>[] = [
  {
    id: "expand",
    enableHiding: false,
    meta: { className: "w-0" },
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground"
        onClick={row.getToggleExpandedHandler()}
        aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
      >
        {row.getIsExpanded()
          ? <ChevronUp className="size-4" />
          : <ChevronDown className="size-4" />}
      </Button>
    ),
  },
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.patientName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.patientName}</span>
          <span className="text-muted-foreground text-xs">{row.original.patientId}</span>
        </div>
      </div>
    ),
  },
  { accessorKey: "ward", header: "Ward" },
  { accessorKey: "diagnosis", header: "Diagnosis" },
  {
    accessorKey: "admittedOn",
    header: "Admitted",
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue("admittedOn")}</span>,
  },
  {
    id: "investigations",
    header: "Tests",
    cell: ({ row }) => (
      <Badge variant="neutral">{row.original.investigations.length} tests</Badge>
    ),
  },
  {
    accessorKey: "encounterStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={encounterStatusVariant[row.getValue("encounterStatus") as PatientEncounter["encounterStatus"]]}>
        {row.getValue("encounterStatus")}
      </Badge>
    ),
  },
]

function renderInvestigationSubTable(row: Row<PatientEncounter>) {
  return (
    <div className="border-t bg-muted/20 px-4 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Investigations \u2014 {row.original.patientName}
      </p>
      <InvestigationSubTable investigations={row.original.investigations} />
    </div>
  )
}

export function PatientEncounterTable() {
  return (
    <DataTable
      columns={encounterColumns}
      data={patientEncounters}
      filterColumn="patientName"
      filterPlaceholder="Search patients..."
      renderExpandedRow={renderInvestigationSubTable}
    />
  )
}`,
      preview: React.createElement(SubDataGridDemo),
    },
    {
      name: "Footer Rows",
      description:
        "Add summary or total rows to the bottom of the table using TanStack Table footer definitions. The footer re-computes automatically when filters change.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"

type Invoice = {
  id: string
  patientName: string
  patientId: string
  date: string
  category: string
  amount: number
  status: "paid" | "pending" | "overdue"
}

const statusVariant = {
  paid:    "success",
  pending: "warning",
  overdue: "destructive",
} as const

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const columns: ColumnDef<Invoice>[] = [
  {
    id: "patient",
    accessorKey: "patientName",
    header: "Patient",
    footer: () => <span className="font-semibold">Total</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.patientName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.patientName}</span>
          <span className="text-muted-foreground text-xs">{row.original.patientId}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    footer: () => null,
  },
  {
    accessorKey: "category",
    header: "Category",
    footer: () => null,
    cell: ({ row }) => <Badge variant="neutral">{row.getValue("category")}</Badge>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    footer: ({ table }) => {
      const total = table
        .getFilteredRowModel()
        .rows.reduce((sum, row) => sum + (row.getValue("amount") as number), 0)
      return <span className="font-semibold tabular-nums">{formatINR(total)}</span>
    },
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <div className="font-medium tabular-nums">{formatINR(row.getValue("amount"))}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    footer: () => null,
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.getValue("status") as Invoice["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function InvoiceTableWithFooter() {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      filterColumn="patientName"
      filterPlaceholder="Search by patient..."
    />
  )
}`,
      preview: React.createElement(FooterRowsDemo),
    },
    {
      name: "Column Icons",
      description:
        "Add a leading icon to column headers by passing an icon node to DataTableColumnHeader \u2014 useful for visually distinguishing clinical data fields at a glance.",
      code: `"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { HeartPulse, MapPin, Stethoscope, User } from "lucide-react"

const patientStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const columns: ColumnDef<Patient>[] = [
  {
    id: "patient",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patient" icon={<User />} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "ward",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ward / Bed" icon={<MapPin />} />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.ward}</span>
        <span className="text-muted-foreground text-xs">{row.original.bed}</span>
      </div>
    ),
  },
  {
    accessorKey: "diagnosis",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diagnosis" icon={<Stethoscope />} />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" icon={<HeartPulse />} />
    ),
    cell: ({ row }) => (
      <Badge variant={patientStatusVariant[row.getValue("status") as Patient["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function ColumnIconPatientTable() {
  return (
    <DataTable
      columns={columns}
      data={patients}
      filterColumn="name"
      filterPlaceholder="Search patients..."
    />
  )
}`,
      preview: React.createElement(ColumnIconsDemo),
    },
    {
      name: "Row Pinning",
      description:
        "Pin important rows to the top of the table so they stay visible while scrolling through the rest of the data. Click the pin icon on any row to toggle it. Uses TanStack Table's built-in row pinning with keepPinnedRows.",
      code: `"use client"

import React, { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  type ColumnDef,
  type RowPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Pin, PinOff } from "lucide-react"

type Patient = {
  id: string
  name: string
  ward: string
  diagnosis: string
  status: "admitted" | "critical" | "stable" | "discharged"
}

const patientStatusVariant = {
  stable:     "success",
  admitted:   "info",
  critical:   "destructive",
  discharged: "neutral",
} as const

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()

const columns: ColumnDef<Patient>[] = [
  {
    id: "pin",
    enableHiding: false,
    meta: { className: "w-0" },
    header: () => null,
    cell: ({ row }) => {
      const isPinned = row.getIsPinned() === "top"
      return (
        <Button
          variant="ghost"
          size="icon"
          className={\`size-7 \${isPinned ? "text-primary" : "text-muted-foreground"}\`}
          onClick={() => row.pin(isPinned ? false : "top")}
          aria-label={isPinned ? "Unpin row" : "Pin row to top"}
        >
          {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </Button>
      )
    },
  },
  {
    id: "patient",
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar shape="rounded">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  { accessorKey: "ward", header: "Ward" },
  { accessorKey: "diagnosis", header: "Diagnosis" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={patientStatusVariant[row.getValue("status") as Patient["status"]]}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

export function RowPinningTable() {
  const [rowPinning, setRowPinning] = useState<RowPinningState>({ top: [], bottom: [] })
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data: patients,
    columns,
    state: { rowPinning, globalFilter },
    onRowPinningChange: setRowPinning,
    onGlobalFilterChange: setGlobalFilter,
    enableRowPinning: true,
    keepPinnedRows: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const pinnedRows = table.getTopRows()
  const unpinnedRows = table.getCenterRows()

  return (
    <div className="w-full space-y-0">
      <div className="flex items-center gap-2 py-4">
        <input
          placeholder="Search patients..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {pinnedRows.length > 0 && pinnedRows.map((row) => (
              <TableRow key={row.id} className="bg-primary/5 font-medium sticky top-0 z-10">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {unpinnedRows.length > 0 ? (
              unpinnedRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}`,
      preview: React.createElement(RowPinningDemo),
    },
  ],
  props: [
    {
      name: "columns",
      type: "ColumnDef<TData, TValue>[]",
      description: "TanStack column definitions for the table.",
    },
    {
      name: "data",
      type: "TData[]",
      description: "The data array to display in the table.",
    },
    {
      name: "filterColumn",
      type: "string",
      description:
        "Key of the column to filter on. Defaults to the first filterable column.",
    },
    {
      name: "filterPlaceholder",
      type: "string",
      description: "Placeholder text for the filter input.",
      default: '"Filter..."',
    },
    {
      name: "cellBorder",
      type: "boolean",
      description: "Adds vertical borders between columns for a spreadsheet-like grid appearance.",
      default: "false",
    },
    {
      name: "dense",
      type: "boolean",
      description: "Reduces cell padding for a compact, high-density table layout.",
      default: "false",
    },
    {
      name: "autoWidth",
      type: "boolean",
      description: "Lets columns size to their content instead of stretching to fill the container width.",
      default: "false",
    },
    {
      name: "renderExpandedRow",
      type: "(row: Row<TData>) => React.ReactNode",
      description: "Renders expanded content below a row when it is toggled open. Pair with a column that calls row.getToggleExpandedHandler().",
    },
    {
      name: "hideToolbar",
      type: "boolean",
      description: "Hides the filter input and column visibility toolbar. Useful for nested sub-tables inside expanded rows.",
      default: "false",
    },
    {
      name: "movableColumns",
      type: "boolean",
      description: "Enables native HTML5 drag-and-drop column reordering. Drag any column header left or right to reorder.",
      default: "false",
    },
    {
      name: "className",
      type: "string",
      description: "Additional CSS classes for the wrapper.",
    },
  ],
};
