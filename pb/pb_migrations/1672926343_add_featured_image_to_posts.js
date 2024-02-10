migrate((db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("posts");
  
    collection.schema.addField(new SchemaField({
      "system": false,
      "id": "featured_image",
      "name": "featuredImage",
      "type": "text",
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