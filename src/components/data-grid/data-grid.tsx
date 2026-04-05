import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

type DataGridProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyState: string;
  getRowKey?: (row: T, index: number) => string;
};

export function DataGrid<T>({
  columns,
  rows,
  emptyState,
  getRowKey,
}: DataGridProps<T>) {
  return (
    <div className="border-border/70 bg-card/70 overflow-hidden rounded-xl border">
      <Table>
        <TableHeader className="bg-card/90 sticky top-0 backdrop-blur">
          <TableRow>
            {columns.map((column) => (
              <TableHead className={column.className} key={column.key}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                className="text-muted-foreground py-8 text-center text-sm"
                colSpan={columns.length}
              >
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={getRowKey ? getRowKey(row, index) : index}>
                {columns.map((column) => (
                  <TableCell className={column.className} key={column.key}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
