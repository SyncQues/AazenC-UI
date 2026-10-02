/**
 * SyncQues file upload.
 * One dashed zone. Avatar, banner, and card skins were the same drop target
 * stretched into a different box. The page owns cropping and the upload request.
 */
export const fileUploadClass =
  "group/upload flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.125rem] border border-dashed border-foreground/35 bg-transparent px-6 py-8 text-center outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-foreground/60 hover:bg-foreground/5 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5 aria-invalid:border-destructive dark:border-foreground/45 dark:hover:border-foreground/70 motion-reduce:transition-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50";

export const fileUploadFileClass =
  "flex items-center gap-3 rounded-full border border-border bg-foreground/5 px-3 py-1.5 text-sm";
