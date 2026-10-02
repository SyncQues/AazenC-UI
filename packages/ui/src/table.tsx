import { type ComponentProps } from "react";
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

export type TableProps = Omit<ComponentProps<"table">, "className">;

function Table(props: TableProps) {
  return (
    <div data-slot="table-container" className={tableContainerClass}>
      <table data-slot="table" className={tableClass} {...props} />
    </div>
  );
}

export type TableHeaderProps = Omit<ComponentProps<"thead">, "className">;

function TableHeader(props: TableHeaderProps) {
  return <thead data-slot="table-header" className={tableHeaderClass} {...props} />;
}

export type TableBodyProps = Omit<ComponentProps<"tbody">, "className">;

function TableBody(props: TableBodyProps) {
  return <tbody data-slot="table-body" className={tableBodyClass} {...props} />;
}

export type TableFooterProps = Omit<ComponentProps<"tfoot">, "className">;

function TableFooter(props: TableFooterProps) {
  return <tfoot data-slot="table-footer" className={tableFooterClass} {...props} />;
}

export type TableRowProps = Omit<ComponentProps<"tr">, "className">;

function TableRow(props: TableRowProps) {
  return <tr data-slot="table-row" className={tableRowClass} {...props} />;
}

export type TableHeadProps = Omit<ComponentProps<"th">, "className">;

function TableHead(props: TableHeadProps) {
  return <th data-slot="table-head" className={tableHeadClass} {...props} />;
}

export type TableCellProps = Omit<ComponentProps<"td">, "className">;

function TableCell(props: TableCellProps) {
  return <td data-slot="table-cell" className={tableCellClass} {...props} />;
}

export type TableCaptionProps = Omit<ComponentProps<"caption">, "className">;

function TableCaption(props: TableCaptionProps) {
  return <caption data-slot="table-caption" className={tableCaptionClass} {...props} />;
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
