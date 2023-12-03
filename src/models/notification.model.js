import Sequelize, { Model } from "sequelize";

class Notification extends Model {
  static init(sequelize) {
    super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          field: "ma_nguoi_dung"
        },
        message: {
          type: Sequelize.JSON,
          field: "thong_bao"
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          field: "da_doc"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "thong_bao" //Define table name
      }
    );
    return this;
  }
}

export default Notification;