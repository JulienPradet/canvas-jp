import { CanvasJpExecuteCanvas } from "../index";
import { get, set } from "idb-keyval";

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemPermissionable {
    queryPermission: (options: { mode: "readwrite" }) => Promise<string>;
    requestPermission: (options: { mode: "readwrite" }) => Promise<string>;
  }

  interface FileSystemFileHandle extends FileSystemPermissionable {
    createWritable: () => Promise<WritableStreamDefaultWriter>;
  }

  interface FileSystemDirectoryHandle extends FileSystemPermissionable {}
}

async function verifyPermission(handle: FileSystemPermissionable) {
  const options = { mode: "readwrite" as const };
  // Check if permission was already granted. If so, return true.
  if ((await handle.queryPermission(options)) === "granted") {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await handle.requestPermission(options)) === "granted") {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}

function exportable(project: string) {
  return function (
    executeCanvasJp: CanvasJpExecuteCanvas,
    container: HTMLElement
  ): CanvasJpExecuteCanvas {
    let directoryHandle: FileSystemDirectoryHandle | null = null;

    async function saveImage(name: string) {
      const directoryHandleKey = "canvasJpDirectoryHandle_" + project;

      if (!directoryHandle) {
        directoryHandle = (await get(directoryHandleKey)) || null;
        if (directoryHandle) {
          if (!(await verifyPermission(directoryHandle))) {
            throw new Error("Permission denied for directory.");
          }
        }
      }
      if (!directoryHandle) {
        directoryHandle = await window.showDirectoryPicker();
        if (directoryHandle) {
          await set(directoryHandleKey, directoryHandle);
        }
      }

      const canvas = container.querySelector("canvas");
      if (!canvas) {
        throw new Error(
          "No canvas found. Was the `executeCanvasJp` method executed before exporting the image?"
        );
      }

      try {
        const fileHandle: FileSystemFileHandle =
          await directoryHandle.getFileHandle(name, {
            create: true,
          });

        if (!(await verifyPermission(fileHandle))) {
          throw new Error("Permission denied for file.");
        }

        const writable: WritableStreamDefaultWriter =
          await fileHandle.createWritable();

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });

        await writable.write(blob);
        await writable.close();

        console.log("saved");
      } catch (e) {
        console.error(e);
      }
    }

    window.addEventListener("keydown", async (event) => {
      if (event.key === "s") {
        const seed = container.dataset.seed;
        await saveImage(`${seed}.png`);
      } else if (event.key === "g") {
        for (let i = 0; i < 20; i++) {
          await executeCanvasJp();
          await saveImage(`${i}.png`);
        }
      }
    });

    return (...args) => executeCanvasJp(...args);
  };
}

export { exportable };
