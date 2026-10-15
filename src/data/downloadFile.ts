/** Löst einen Browser-Download für beliebige JSON-Daten aus (Play-/Defense-Export,
 *  Komplett-Backup, siehe Projektauftrag 5.8/5.9). */
export function downloadJson(filename: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function downloadNamedJson(baseName: string, data: unknown): void {
  downloadJson(`${slugify(baseName) || "export"}.json`, data);
}
