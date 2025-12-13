import { QdrantClient } from "@qdrant/js-client-rest";
import { qdrantUrl } from "../config/env.js";

export const client = new QdrantClient({ url: qdrantUrl });

export const checkConnection = async () => {
  try {
    const collections = await client.getCollections();
    console.log("✅ Qdrant: Connected");
    return true;
  } catch (err) {
    console.error("❌ Qdrant: Connection Failed", err.message);
    return false;
  }
};

export const ensureCollection = async (collectionName) => {
  try {
    const response = await client.getCollections();
    const exists = response.collections.some((c) => c.name === collectionName);

    if (!exists) {
      console.log(`⚠️ Collection '${collectionName}' not found. Creating...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: 384,
          distance: "Cosine",
        },
      });
      console.log(`✅ Qdrant: Collection '${collectionName}' created.`);
    } else {
      console.log(`✅ Qdrant: Collection '${collectionName}' ready.`);
    }
    return true;
  } catch (err) {
    console.error(
      `❌ Qdrant: Failed to ensure collection '${collectionName}'`,
      err.message
    );
    return false;
  }
};
