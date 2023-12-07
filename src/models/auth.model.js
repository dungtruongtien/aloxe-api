import Sequelize, { Model } from "sequelize";

class Auth extends Model {
  static init(sequelize) {
    super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          unique: true,
          field: "ma_nguoi_dung"
        },
        username: {
          type: Sequelize.STRING,
          field: "ten_dang_nhap"
        },
        password: {
          type: Sequelize.STRING,
          field: "mat_khau"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "xac_thuc" //Define table name
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "ma_nguoi_dung",
      as: 'user',
    })
  }
}

export default Auth;