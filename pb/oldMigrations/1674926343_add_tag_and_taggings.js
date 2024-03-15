migrate(
  (db) => {
    const dao = new Dao(db);

    // Create 'tags' collection
    const tagsCollection = new Collection({
      id: "bn4x5o6vc74zoxv", // Ensure a unique ID
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      name: "tags",
      type: "base",
      system: false,
      schema: [
        {
          system: false,
          id: "6dbyxf6owzw4cel",
          name: "name",
          type: "text",
          required: true,
          unique: true, // Tag names should be unique
          options: {
            min: null,
            max: null,
            pattern: "",
          },
        }
      ],
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      options: {},
    });
    dao.saveCollection(tagsCollection);

    // Create 'taggings' collection
    const taggingsCollection = new Collection({
      id: "tb7oaw3poobovn2", // Ensure a unique ID
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      name: "taggings",
      type: "base",
      system: false,
      schema: [
        {
          system: false,
          id: "ev3s55u0mys2wqd",
          name: "tag_id",
          type: "relation",
          required: true,
          unique: false,
          options: {
            maxSelect: 1,
            collectionId: "bn4x5o6vc74zoxv", // Use the actual ID of the 'tags' collection
            cascadeDelete: true,
          },
        },
        {
          system: false,
          id: "m09j9e3aljndgju",
          name: "post_id",
          type: "relation",
          required: true,
          unique: false,
          options: {
            maxSelect: 1,
            collectionId: "5bba43cis9ctxr2", // ID of the 'posts' collection
            cascadeDelete: true,
          },
        }
      ],
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      options: {},
    });
    dao.saveCollection(taggingsCollection);
  },
  (db) => {
    // Optional rollback logic for removing 'tags' and 'taggings' collections
    const dao = new Dao(db);

    // Delete 'taggings' collection
    const taggingsCollection = dao.findCollectionByNameOrId("tb7oaw3poobovn2");
    dao.deleteCollection(taggingsCollection);

    // Delete 'tags' collection
    const tagsCollection = dao.findCollectionByNameOrId("bn4x5o6vc74zoxv");
    dao.deleteCollection(tagsCollection);
  }
);