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
        longitude: {
          type: Sequelize.FLOAT,
          field: "longitude"
        },
        latitude: {
          type: Sequelize.FLOAT,
          field: "latitude"
        },
        appliedVoucher: {
          type: Sequelize.STRING,
          field: "ma_giam_gia_ap_dung"
        },
        pickUpPoint: {
          type: Sequelize.STRING,
          field: "diem_don"
        },
        dropOffPoint: {
          type: Sequelize.STRING,
          field: "diem_den"
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