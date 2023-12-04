import Sequelize, { Model } from "sequelize";

class BookingDetail extends Model {
  static init(sequelize) {
    super.init(
      {
        bookingId: {
          type: Sequelize.INTEGER,
          field: "ma_dat_xe",
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          field: "mo_ta"
        },
        pickUpLongitude: {
          type: Sequelize.DECIMAL(11, 8),
          field: "longitude_diem_don"
        },
        pickUpLatitude: {
          type: Sequelize.DECIMAL(10, 8),
          field: "latitude_diem_don"
        },
        dropOffLongitude: {
          type: Sequelize.DECIMAL(11, 8),
          field: "longitude_diem_den"
        },
        dropOffLatitude: {
          type: Sequelize.DECIMAL(10, 8),
          field: "latitude_diem_den"
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
        vehicleType: {
          type: Sequelize.STRING,
          field: "loai_xe" // 4 chỗ, 5 chỗ, 7 chỗ, VIP
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