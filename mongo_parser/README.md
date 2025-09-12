> This is fragment of the codebase, where the main problem and task was related to move all data from dynamo db to mongo db.

#### **So the problems that this code is actualy solve:**

1. Transform dynamo db data representation into json-closer variant (simply speaking flat data type representation level of object depth, that is used in dynamo db)
    - example:
        ```javascript
          /**
          * So this is how user can be represented in dynamo db.
          * The json itself has properties that represent data type.
          **/
          {
            "UserId": {
              "S": "user-12345"
            },
            "Username": {
              "S": "johndoe"
            },
            "Email": {
              "S": "john.doe@email.com"
            },
            "Age": {
              "N": "30"
            },
            "IsActive": {
              "BOOL": true
            },
          }
          /**
          * The natural JSON representation, but this is exactly the same user, but
          * in more simpler and friendly view.
          **/
          {
            "UserId": "user-12345",
            "Username": "johndoe",
            "Email": "john.doe@email.com",
            "Age": 30,
            "IsActive": true,
          }
        ```
2. Also make extra transformation to extend JSON values with another one, that mongodb is support
    - example: `'2025-09-12 02:12:17'` _(string)_ to `new Date('2025-09-12 02:12:17')`
3. Do this recurcivelly
4. But without recursion
5. Automatically switch from previous ID to mongodb ObjectId
6. Though new _id are generated - restore relations between documents (foreign keys)

#### P.S.
This is not completely refactored version, and it can also can be improved... it even contains some hardcods.
Also it is expect some extra data parsing (in this case - create "_deprecated_id" property.
But for those project, terms etc. it was working solution.
