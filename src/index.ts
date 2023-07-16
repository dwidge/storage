import { createStorage } from "@dwidge/storage";
import { storageEnv } from "@dwidge/storage/StorageEnv";

const storage = createStorage(storageEnv);
storage.listAll("").then((list) => console.log("listAll1", list));
