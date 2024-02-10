migrate((db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("posts"); // Use the correct collection ID or name
  
    // Add the tags field
    collection.schema.addField(new SchemaField({
      "system": false,
      "id": "tags", // It's okay to use a simple ID here since it's a new field
      "name": "tags",
      "type": "text", // Assuming tags will be stored as a comma-separated string
      "required": false,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "pattern": ""
      }
    }));
  
    return dao.saveCollection(collection);
  });