import Sequelize, { Model } from "sequelize";

class Customer extends Model {
  static init(sequelize) {
    super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          field: "ma_nguoi_dung"
        },
        level: {
          type: Sequelize.STRING,
          field: "cap_bac"
        },
        dob: {
          type: Sequelize.DATE,
          field: "ngay_sinh"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "khach_hang" //Define table name
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "ma_nguoi_dung",
      as: "user",
    });
  }
}

export default Customer;