"use client"
import { ColumnDef } from "@tanstack/react-table"
import { StatusTransaksi } from "@prisma/client"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPP", { locale: id })
    }
  },
  {
    accessorKey: "kendaraan.noPolisi",
    header: "Nomor Polisi",
  },
  {
    accessorKey: "kendaraan.merk",
    header: "Kendaraan",
  },
  {
    accessorKey: "karyawan.name",
    header: "Mekanik",
  },
  {
    accessorKey: "totalHarga",
    header: "Total Biaya",
    cell: ({ row }) => {
      return `Rp ${(row.getValue("totalHarga") as number).toLocaleString()}`
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as StatusTransaksi
      const colors = {
        PENDING: "yellow",
        PROCESS: "blue",
        COMPLETED: "green",
        CANCELLED: "red"
      }
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${colors[status]}-100 text-${colors[status]}-800`}>
          {status}
        </span>
      )
    }
  }
]
