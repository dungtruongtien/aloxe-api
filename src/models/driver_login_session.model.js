import Sequelize, { Model } from "sequelize";

class DriverLoginSession extends Model {
  static init(sequelize) {
    super.init(
      {
        driverId: {
          type: Sequelize.INTEGER,
          field: "ma_tai_xe",
          unique: true,
        },
        currentLat: {
          type: Sequelize.DECIMAL(10,8),
          field: "lat_vi_tri_hien_tai"
        },
        currentLong: {
          type: Sequelize.DECIMAL(11,8),
          field: "long_vi_tri_hien_tai"
        },
        status: {
          type: Sequelize.STRING,
          field: "trang_thai" // Online, Offline
        },
        drivingStatus: {
          type: Sequelize.STRING,
          field: "trang_thai_lam_viec" // Driving, Waiting_for_customer
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "tai_xe_phien_dang_nhap" //Define table name
      }
    );
    return this;
  }
}

export default DriverLoginSession;