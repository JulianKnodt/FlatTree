const NumRepresentation = str => str.split('').reduce((total, next) => total * next.charCodeAt(0), 1);
const uid = (v, secret="") => NumRepresentation(JSON.stringify(v)+secret).toString(36);
class FlatTreeNode  {
  constructor(value, flatTree, parentKey) {
    this._value = value;
    this.root = flatTree;
    this.key = flatTree.identifier(value, flatTree.key);
    this._childrenKeys = [];
    this._parentKey = parentKey;
    this.depth = this.parent ? this.parent.depth + 1 : 0;
  }
  get value () {
    return this._value;
  }
  set value(val) {
    this._value = val;
    delete this.root._storage[this.key]
    let oldKey = this.key.valueOf();
    this.key = this.root.identifier(val, this.root.key);
    this.children.forEach(child => child._parentKey = this.key);
    this.parent && (this.parent._childrenKeys = this.parent._childrenKeys.map(x => x === oldKey ? this.key : x));
    this.root._storage[this.key] = this;
  }
  delete() {
    let old = this;
    this.root.deleteAllIndeces(this);
    this.parent && (this.parent._childrenKeys = this.parent._childrenKeys.filter(x => x !== this.key));
    this.children.forEach(child => child.delete());
    delete this.root._storage[this.key];
    return old;
  }
  get parent() {
    return this._parentKey ? this.root.getByKey(this._parentKey) : null;
  }
  addChild (value) {
    let child = new FlatTreeNode(value, this.root, this.key);
    this.root._storage[child.key] = child;
    this._childrenKeys.push(child.key);
    child._parentKey = this.key;
    this.root.indexAll(child);
    return child;
  }
  get children () {
    return this._childrenKeys.map(key => this.root.getByKey(key));
  }
}
class FlatTree {
  constructor (storageObject={}, identifier=uid) {
    this._storage = storageObject;
    this.identifier = identifier;
    this._key = (~~(Math.random()*100000)).toString(36);
    let head = new FlatTreeNode({}, this, 'head-' + this.key);
    head.key = "head-" + this.key;
    this._storage["head-" + this._key] = head;
    this._indeces = {};
    this._size = 0;
  }
  get head () {
    return this._storage["head-"+this._key];
  }
  get key () {
    return this._key;
  }
  addChild (value) {
    this._size ++;
    return this.head.addChild(value);
  }
  get size() {
    return this._size
  }
  _containsKey(val) {
    return this._storage[val] !== undefined;
  }
  getByKey(key) {
    return this._storage[key];
  }
  get(value) {
    return this.getByKey(this.identifier(value, this.key));
  }
  deleteByKey(key) {
    return this.getByKey(key).delete();
  }
  delete(value) {
    this.get(value).delete();
  }
  getByIndexedValue(indexName, value) {
    let indexedVals = this._indeces[indexName] ? this._indeces[indexName][value] : null;
    if(!indexedVals) return null;
    return indexedVals.map(this.getByKey.bind(this));
  }
  getByIndexOneOrNone(indexName, value) {
    let indexedVals = this._indeces[indexName] ? this._indeces[indexName][value] : null;
    if(!indexedVals) return null;
    return indexedVals.length > 0 ? this.getByKey(indexedVals[0]) : null;
  }
  index(key, indexer) {
    this._indeces[key] = {_indexer: indexer};
    for (let prop in this._storage) {
      if (this.getByKey(prop).parent) {
        let node = this.getByKey(prop);
        this.indexNode(node, key);
      }
    }
  }
  deleteAllIndeces(node) {
    for (let key in this._indeces) {
      let indexer = this._indeces[key]._indexer;
      let indexedValue = indexer(node.value);
      this._indeces[key][indexedValue] = this._indeces[key][indexedValue].filter(key => key !== node.key);
    }
  }
  indexNode(node, key) {
    let indexer = this._indeces[key]._indexer;
    let indexedValue = indexer(node.value);
    indexedValue !== undefined && (this._indeces[key][indexedValue] = (this._indeces[key][indexedValue] || []).concat(node.key));
  }
  indexAll(node) {
    for (let key in this._indeces) {
      this.indexNode(node, key);
    }
  }
};

module.exports = FlatTree;
