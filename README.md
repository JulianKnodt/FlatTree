# NormalTree/FlatTree


`npm install normaltree`

```
const FlatTree = require('normaltree');

let sharedStorage = {};
let primaryKey = model => model.id;
//Both of these are optional parameters.
let ft = new FlatTree(sharedStorage, primaryKey);
ft.index("name", model => model.name);
ft.addChild({id: 1, name: "John Doe"});
```

##### More:
```
ft.getByIndexedValue("name", "John Doe"); //[FlatTreeNode]
ft.getByIndexOneOrNone("name", "John Doe"); //FlatTreeNode
ft.get({id: 1}) // FlatTreeNode
ft.get({id: 1}) === ft.getByIndexOneOrNone("name", "John Doe"); // true
ft.getByKey(1); //FlatTreeNode
ft.getByKey(1).addChild({id: 2, name: "Alice Bailey"}); //new FlatTreeNode

ft.getByKey(1).children // [FlatTreeNode Alice]

ft.getByKey(1).delete();
ft.getByKey(1); //undefined

```

> FlatTree is pass by value.

> Cannot Index Null Values

> Built-in uid function might lead to hash collisions

---
### MIT
