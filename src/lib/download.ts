// Purpose: client-only file download: a Blob behind a temporary link, with no library.
// Browser only; call it from an event handler, never during render.

/** Why: a Blob URL lets the browser save text as a file; the URL is freed as soon as the click is done. */
export function downloadText(
   fileName: string,
   content: string,
   mimeType: string,
): void {
   const blob = new Blob([content], { type: mimeType });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = fileName;
   link.hidden = true;
   document.body.append(link);
   link.click();
   link.remove();
   URL.revokeObjectURL(url);
}
