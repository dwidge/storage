import { createStorage } from "../lib/index";
import { storageEnv } from "../lib/StorageEnv";

const storage = createStorage(storageEnv);
storage.listAll("").then((list) => console.log("listAll1", list));
