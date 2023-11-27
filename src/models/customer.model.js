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
        address: {
          type: Sequelize.STRING,
          field: "dia_chi"
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
}

export default Customer;