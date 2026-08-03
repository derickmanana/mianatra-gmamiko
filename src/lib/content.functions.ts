import { createServerFn } from "@tanstack/react-start";

export const fetchFolders = createServerFn({ method: "GET" }).handler(async () => {
  const { listFolders } = await import("./content.server");
  return listFolders();
});

export const checkAdminCode = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    const { ADMIN_CODE } = await import("./content.server");
    if (data.code !== ADMIN_CODE) throw new Error("Code administrateur incorrect.");
    return { ok: true };
  });

export const fetchFolderContent = createServerFn({ method: "POST" })
  .inputValidator((d: { folderId: string; code?: string; adminCode?: string }) => d)
  .handler(async ({ data }) => {
    const { getFolderContent } = await import("./content.server");
    return getFolderContent(data.folderId, data.code ?? null, data.adminCode ?? null);
  });

export const saveFolder = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; id?: string; name: string; accessCode: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./content.server");
    m.assertAdmin(data.adminCode);
    if (data.id) await m.updateFolder(data.id, data.name, data.accessCode);
    else await m.createFolder(data.name, data.accessCode);
    return { ok: true };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; table: "folders" | "blocks" | "items"; id: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./content.server");
    m.assertAdmin(data.adminCode);
    await m.removeRow(data.table, data.id);
    return { ok: true };
  });

export const saveBlock = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; id?: string; folderId?: string; name: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./content.server");
    m.assertAdmin(data.adminCode);
    if (data.id) await m.renameBlock(data.id, data.name);
    else await m.createBlock(data.folderId!, data.name);
    return { ok: true };
  });

export const reorderRows = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; table: "folders" | "blocks" | "items"; ids: string[] }) => d)
  .handler(async ({ data }) => {
    const m = await import("./content.server");
    m.assertAdmin(data.adminCode);
    await m.reorder(data.table, data.ids);
    return { ok: true };
  });

export const saveItem = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      adminCode: string;
      id?: string;
      blockId?: string;
      type?: "image" | "pdf" | "word" | "link" | "text";
      title: string | null;
      content: string | null;
      url: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    const m = await import("./content.server");
    m.assertAdmin(data.adminCode);
    if (data.id) await m.updateItem({ id: data.id, title: data.title, content: data.content, url: data.url });
    else
      await m.createItem({
        blockId: data.blockId!,
        type: data.type!,
        title: data.title,
        content: data.content,
        url: data.url,
      });
    return { ok: true };
  });

export const requestUpload = createServerFn({ method: "POST" })
  .inputValidator((d: { adminCode: string; fileName: string }) => d)
  .handler(async ({ data }) => {
    const m = await import("./content.server");
    m.assertAdmin(data.adminCode);
    return m.createUpload(data.fileName);
  });
