import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  tableBodyClass,
  tableCaptionClass,
  tableCellClass,
  tableClass,
  tableContainerClass,
  tableFooterClass,
  tableHeadClass,
  tableHeaderClass,
  tableRowClass,
} from "./table-variants";

export type TableProps = Omit<ComponentProps<"table">, "className"> & {
  className?: string;
};

function Table({ className, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className={tableContainerClass}>
      <table data-slot="table" className={cn(tableClass, className)} {...props} />
    </div>
  );
}

export type TableHeaderProps = Omit<ComponentProps<"thead">, "className"> & {
  className?: string;
};

function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead data-slot="table-header" className={cn(tableHeaderClass, className)} {...props} />;
}

export type TableBodyProps = Omit<ComponentProps<"tbody">, "className"> & {
  className?: string;
};

function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody data-slot="table-body" className={cn(tableBodyClass, className)} {...props} />;
}

export type TableFooterProps = Omit<ComponentProps<"tfoot">, "className"> & {
  className?: string;
};

function TableFooter({ className, ...props }: TableFooterProps) {
  return <tfoot data-slot="table-footer" className={cn(tableFooterClass, className)} {...props} />;
}

export type TableRowProps = Omit<ComponentProps<"tr">, "className"> & {
  selected?: boolean;
  className?: string;
};

function TableRow({ selected, className, ...props }: TableRowProps) {
  return (
    <tr
      {...props}
      data-slot="table-row"
      className={cn(tableRowClass, className)}
      {...(selected ? { "data-state": "selected" } : {})}
    />
  );
}

export type TableHeadProps = Omit<ComponentProps<"th">, "className"> & {
  wrap?: boolean;
  className?: string;
};

function TableHead({ scope = "col", wrap = false, className, ...props }: TableHeadProps) {
  return <th scope={scope} data-slot="table-head" data-wrap={wrap ? "true" : undefined} className={cn(tableHeadClass, className)} {...props} />;
}

export type TableCellProps = Omit<ComponentProps<"td">, "className"> & {
  wrap?: boolean;
  className?: string;
};

function TableCell({ wrap = false, className, ...props }: TableCellProps) {
  return <td data-slot="table-cell" data-wrap={wrap ? "true" : undefined} className={cn(tableCellClass, className)} {...props} />;
}

export type TableCaptionProps = Omit<ComponentProps<"caption">, "className"> & {
  className?: string;
};

function TableCaption({ className, ...props }: TableCaptionProps) {
  return <caption data-slot="table-caption" className={cn(tableCaptionClass, className)} {...props} />;
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
