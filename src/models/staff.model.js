import Sequelize, { Model } from "sequelize";

class Staff extends Model {
  static init(sequelize) {
    super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          unique: true,
          field: "ma_nguoi_dung"
        },
        staffCode: {
          type: Sequelize.STRING,
          field: "ma_nhan_vien"
        },
        position: {
          type: Sequelize.STRING,
          field: "chuc_vu"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "nhan_vien" //Define table name
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "ma_nguoi_dung",
      as: 'user'
    });
  }
}

export default Staff;