migrate(
  (db) => {
    const dao = new Dao(db);

    if (!dao.findCollectionByNameOrId("posts")) {
      // Posts collection
      const postsCollection = new Collection({
        id: "5bba43cis9ctxr2", // Ensure a unique ID
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        name: "posts",
        type: "base",
        system: false,
        schema: [
          {
            system: false,
            id: "title",
            name: "title",
            type: "text",
            required: true,
            unique: false,
          },
          {
            system: false,
            id: "body",
            name: "body",
            type: "text",
            required: true,
            unique: false,
          },
          {
            system: false,
            id: "slug",
            name: "slug",
            type: "text",
            required: true,
            unique: true,
          },
          {
            system: false,
            id: "user",
            name: "user",
            type: "relation",
            required: true,
            unique: false,
            options: { collectionId: "users" },
          },
          {
            system: false,
            id: "featuredImage",
            name: "featuredImage",
            type: "relation",
            required: false,
            unique: false,
            options: {
              maxSelect: 1,
              collectionId: "images",
              cascadeDelete: true,
            },
          },
          {
            system: false,
            id: "blogSummary",
            name: "blogSummary",
            type: "text",
            required: false,
            unique: false,
          },
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        options: {},
      });
      dao.saveCollection(postsCollection);
    }

    if (!dao.findCollectionByNameOrId("auditLog")) {
      // AuditLog collection
      const auditLogCollection = new Collection({
        id: "auditlog_id", // Ensure a unique ID
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        name: "auditLog",
        type: "base",
        system: false,
        schema: [
          {
            system: false,
            id: "user",
            name: "user",
            type: "relation",
            required: true,
            unique: false,
            options: { collectionId: "users" },
          },
          {
            system: false,
            id: "action",
            name: "action",
            type: "text",
            required: true,
            unique: false,
          },
          {
            system: false,
            id: "timestamp",
            name: "timestamp",
            type: "date",
            required: false,
            unique: false,
          },
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        options: {},
      });
      dao.saveCollection(auditLogCollection);
    }

    if (!dao.findCollectionByNameOrId("hooks")) {
      // Hooks collection
      const hooksCollection = new Collection({
        id: "hooks_id", // Ensure a unique ID
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        name: "hooks",
        type: "base",
        system: false,
        schema: [
          {
            system: false,
            id: "collection",
            name: "collection",
            type: "text",
            required: true,
            unique: false,
          },
          {
            system: false,
            id: "event",
            name: "event",
            type: "text",
            required: true,
            unique: false,
          },
          {
            system: false,
            id: "actionType",
            name: "actionType",
            type: "text",
            required: true,
            unique: false,
          },
          {
            system: false,
            id: "action",
            name: "action",
            type: "text",
            required: true,
            unique: false,
          },
          {
            system: false,
            id: "actionParams",
            name: "actionParams",
            type: "text",
            required: false,
            unique: false,
          },
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        options: {},
      });
      dao.saveCollection(hooksCollection);
    }

    if (!dao.findCollectionByNameOrId("tags")) {
      // Tags collection
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
            unique: true,
            options: { min: null, max: null, pattern: "" },
          },
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        options: {},
      });
      dao.saveCollection(tagsCollection);
    }

    if (!dao.findCollectionByNameOrId("taggings")) {
      // Taggings collection
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
          },
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        options: {},
      });
      dao.saveCollection(taggingsCollection);
    }

    if (!dao.findCollectionByNameOrId("images")) {
      // Images collection
      const imagesCollection = new Collection({
        id: "330ymzpw61y1j5f", // Ensure a unique ID
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        name: "images",
        type: "base",
        system: false,
        schema: [
          {
            system: false,
            id: "r0j55kc9",
            name: "file",
            type: "file",
            required: false,
            presentable: false,
            unique: false,
            options: {
              maxSelect: 1,
              maxSize: 5242880,
              mimeTypes: [],
              thumbs: [],
              protected: false,
            },
          },
        ],
        indexes: [],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        options: {},
      });

      dao.saveCollection(imagesCollection);
    }
  },
  (db) => {
    // Optional rollback logic for removing collections
    const dao = new Dao(db);

    // Delete 'taggings' collection
    const taggingsCollection = dao.findCollectionByNameOrId("tb7oaw3poobovn2");
    dao.deleteCollection(taggingsCollection);

    // Delete 'tags' collection
    const tagsCollection = dao.findCollectionByNameOrId("bn4x5o6vc74zoxv");
    dao.deleteCollection(tagsCollection);

    // Delete 'hooks' collection
    const hooksCollection = dao.findCollectionByNameOrId("hooks_id");
    dao.deleteCollection(hooksCollection);

    // Delete 'auditLog' collection
    const auditLogCollection = dao.findCollectionByNameOrId("auditlog_id");
    dao.deleteCollection(auditLogCollection);

    // Delete 'posts' collection
    const postsCollection = dao.findCollectionByNameOrId("5bba43cis9ctxr2");
    dao.deleteCollection(postsCollection);
  }
);
