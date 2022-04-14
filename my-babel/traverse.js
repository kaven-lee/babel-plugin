const types = require("./types");

class NodePath {
  constructor(node, parent, parentPath, key, listKey) {
    this.node = node;
    this.parent = parent;
    this.parentPath = parentPath;
    this.key = key;
    this.listKey = listKey;

    Object.keys(types).forEach(key => {
      if (key.startsWith('is')) {
        this[key] = types[key].bind(this, node);
      }
    })
  }

  get scope() {
    if (this.__scope) {
      return this.__scope;
    }
    const isBlock = this.isBlock();
    const parentScope = this.parentPath && this.parentPath.scope;
    return this.__scope = isBlock ? new Scope(parentScope, this) : parentScope;
  }

  isBlock() {
    return types.visitorKeys.get(this.node.type).isBlock;
  }

  traverse(visitors) {
    const defination = types.visitorKeys.get(this.node.type);

    if (defination.visitor) {
      defination.visitor.forEach(key => {
        const prop = this.node[key];
        if (Array.isArray(prop)) { 
          prop.forEach((childNode, index) => {
            traverse(childNode, visitors, this.node, this);
          })
        } else {
          traverse(prop, visitors, this.node, this);
        }
      })
    }
  }

  replaceWith(node) {
    if (this.listKey !== undefined) {
      this.parent[key].splice(this.listKey, 1, node)
    } else {
      this.parent[key] = node;
    }
  }

  remove() {
    if (this.listKey != undefined) {
      this.parent[this.key].splice(this.listKey, 1);
    } else {
      this.parent[this.key] = null;
    }
  }

  findParent(callback) {
    let curPath = this.parentPath;
    while (curPath && !callback(curPath)) {
      curPath = curPath.parentPath;
    }
    return curPath;
  }

  find(callback) {
    let curPath = this;
    while (curPath && !callback(curPath)) {
      curPath = curPath.parentPath;
    }
    return curPath;
  }

  skip() {
    this.node.__shouldSkip = true;
  }
}

// 记录声明
class Binding {
  constructor(id, path, scope, kind) {
    this.id = id;
    this.paht = path;
    this.referenced = false;
    this.referencePaths = [];
  }
}

// 记录作用域
class Scope {
  constructor(parentScope, path) {
    this.parent = parentScope;
    this.bindings = {};
    this.path = path;

    // 遍历所有声明 注册到bindings
    path.traverse({
      VariableDeclarator: (childPath) => {
        this.registerBinding(childPath.node.id.name, childPath);
      },
      FunctionDeclaration: (childPath) => {
        childPath.skip();
        this.registerBinding(childPath.node.id.name, childPath);
      }
    });

    // 获取所有引用
    path.traverse({
      Identifier: (childPath) => {
        if (!childPath.findParent((p => p.isVariableDeclarator()) || (p => p.isFunctionDeclarator()))) {
          const id = childPath.node.name;
          const binding = this.getBinding(id);
          if (binding) {
              binding.referenced = true;
              binding.referencePaths.push(childPath);
          }
        }
      }
    })
  }

  registerBinding(id, path) {
    this.bindings[id] = new Binding(id, path);
  }

  getOwnBinding(id) {
    return this.bindings[id];
  }

  getBinding(id) {
    let binding = this.getOwnBinding(id);
    if (binding === undefined && this.parent) {
      binding = this.parent.getOwnBinding(id);
    }
    return binding;
  }

  hasBinding(id) {
    return !!this.getBinding(id);
  }
}

// 遍历AST 
function traverse(ast, visitors, parent, parentPath, key, listKey) {
  const defination = types.visitorKeys.get(ast.type);

  let visitorFuncs = visitors[ast.type] || {};

  if (typeof visitorFuncs === 'function') {
    visitorFuncs = {
      enter: visitorFuncs
    }
  }

  const path = new NodePath(ast, parent, parentPath, key, listKey);

  visitorFuncs.enter && visitorFuncs.enter(path);


  if (ast.__shouldSkip) {
    delete ast.__shouldSkip;
    return;
  }

  if (defination?.visitor) {
    defination.visitor.forEach(key => {
      const prop = ast[key];
      if (Array.isArray(prop)) {
        prop.forEach((childNode, index) => {
          traverse(childNode, visitors, ast, path, key, index);
        })
      } else {
        traverse(prop, visitors, ast, path, key);
      }
    })
  }

  visitorFuncs.exit && visitorFuncs.exit(path);

}

module.exports = traverse;