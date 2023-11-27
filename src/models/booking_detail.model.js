import Sequelize, { Model } from "sequelize";

class BookingDetail extends Model {
  static init(sequelize) {
    super.init(
      {
        bookingId: {
          type: Sequelize.INTEGER,
          field: "ma_dat_xe"
        },
        description: {
          type: Sequelize.TEXT,
          field: "mo_ta"
        },
        status: {
          type: Sequelize.STRING,
          field: "trang_thai"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "chi_tiet_dat_xe" //Define table name
      }
    );
    return this;
  }
}

export default BookingDetail;