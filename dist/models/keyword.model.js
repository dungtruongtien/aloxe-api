"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = _interopRequireWildcard(require("sequelize"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class Keyword extends _sequelize.Model {
  static init(sequelize) {
    super.init({
      userId: _sequelize.default.INTEGER,
      totalAdWordsAdvertisers: _sequelize.default.INTEGER,
      adWordsAdvertisers: _sequelize.default.JSON,
      totalLinks: _sequelize.default.INTEGER,
      links: _sequelize.default.JSON,
      searchResultStatistics: _sequelize.default.STRING,
      htmlStaticLink: _sequelize.default.STRING,
      keyword: _sequelize.default.STRING
    }, {
      sequelize,
      timestamps: true,
      //If it's false do not add the attributes (updatedAt, createdAt).
      tableName: 'keyword' //Define table name
    });

    return this;
  }
}
var _default = exports.default = Keyword;