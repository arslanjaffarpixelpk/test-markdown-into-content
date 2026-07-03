import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { RichRendererProps } from './registry';
import type { TableSpec } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Row = Record<string, string | number>;

export function TableRenderer({ data }: RichRendererProps) {
  const spec = data as TableSpec;
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () =>
      spec.columns.map((c) => ({
        accessorKey: c.key,
        header: c.label,
        meta: { align: c.align ?? 'left' },
      })),
    [spec.columns],
  );

  const table = useReactTable({
    data: spec.rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: spec.sortable !== false,
  });

  const alignClass = (align?: string) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <Card className="my-4">
      {spec.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{spec.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={spec.title ? 'pt-0' : 'pt-6'}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const align = (header.column.columnDef.meta as { align?: string })?.align;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(alignClass(align), canSort && 'cursor-pointer select-none')}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort &&
                          (sorted === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                          ))}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: string })?.align;
                  return (
                    <TableCell key={cell.id} className={alignClass(align)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
