import JoiToSwagger from "joi-to-swagger";
import { joiSchemasMap } from "./joiSchemasMap";

/**
 * Converts a single Joi schema function to a Swagger-compatible schema.
 */
export const getSwaggerSchemaFromJoi = (schemaFn: Function): any | null => {
  try {
    console.log(`🔹 Extracting Joi schema from: ${schemaFn.name}`);

    const schema = schemaFn();
    if (!schema || typeof schema.validate !== "function") {
      console.warn(`⚠️ ${schemaFn.name} did not return a valid Joi schema`);
      return null;
    }

    const { swagger } = JoiToSwagger(schema);
    console.log(
      `✅ Swagger schema successfully generated for ${schemaFn.name}`,
    );

    // 🔥 FIX: detect file fields & override to binary format
    const meta = schema._meta || [];
    if (meta.some((m: any) => m.swaggerType === "file")) {
      console.log(
        "📂 Detected file upload in Joi schema → forcing binary format",
      );
      return {
        type: "string",
        format: "binary",
      };
    }
    // 🔥 FIX: deep scan child properties for file meta
    if (swagger.properties) {
      for (const [key] of Object.entries(swagger.properties)) {
        const childSchema: any = schema.describe().keys?.[key];
        if (childSchema?.metas?.some((m: any) => m.swaggerType === "file")) {
          console.log(
            `📁 File detected on field "${key}", converting to binary`,
          );
          swagger.properties[key] = {
            type: "string",
            format: "binary",
          };
        }
      }
    }

    console.log(
      `✅ Swagger schema successfully generated for ${schemaFn.name}`,
    );
    return swagger;
  } catch (err) {
    console.error(
      `❌ Failed to extract Joi schema for ${schemaFn.name}:`,
      (err as any).message,
    );
    return null;
  }
};

/**
 * Automatically generates Swagger schemas for all validators in `joiSchemasMap`.
 */
export const generateAllSwaggerSchemas = (): Record<string, any> => {
  const allSchemas: Record<string, any> = {};

  console.log("🚀 Generating all Swagger schemas from Joi validators...");

  for (const [name, schemaFn] of Object.entries(joiSchemasMap)) {
    const swaggerSchema = getSwaggerSchemaFromJoi(schemaFn);
    if (swaggerSchema) {
      allSchemas[name] = swaggerSchema;
    } else {
      console.warn(`⚠️ Failed to generate schema for ${name}`);
    }
  }

  console.log("✅ All Swagger schemas generated successfully.");
  return allSchemas;
};
