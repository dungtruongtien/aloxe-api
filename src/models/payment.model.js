import Sequelize, { Model } from "sequelize";

class Payment extends Model {
  static init(sequelize) {
    super.init(
      {
        bookingId: {
          type: Sequelize.INTEGER,
          field: "ma_dat_xe"
        },
        transactionId: {
          type: Sequelize.STRING,
          field: "ma_giao_dich",
        },
        paymentMethod: {
          type: Sequelize.STRING,
          field: "phuong_thuc_thanh_toan",
        },
        amount: {
          type: Sequelize.INTEGER,
          field: "so_tien"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "thanh_toan" //Define table name
      }
    );
    return this;
  }
}

export default Payment;