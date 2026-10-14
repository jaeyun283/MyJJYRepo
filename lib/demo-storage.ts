const DB = "record-demo-files-v1";
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("files");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () =>
      reject(new Error("브라우저 파일 저장소를 열 수 없습니다."));
  });
}
export async function saveFile(id: string, file: File) {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("파일 저장에 실패했습니다."));
    });
  } finally {
    db.close();
  }
}
export async function getFile(id: string): Promise<Blob | undefined> {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("files");
      const r = tx.objectStore("files").get(id);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(new Error("파일을 열 수 없습니다."));
    });
  } finally {
    db.close();
  }
}
export async function removeFile(id: string) {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("파일 삭제에 실패했습니다."));
    });
  } finally {
    db.close();
  }
}
