import Sequelize, { Model } from "sequelize";
/* 
BookingStatus.BOOKED,
BookingStatus.WAITING_FOR_DRIVER,
BookingStatus.DRIVER_FOUND,
BookingStatus.DRIVER_CAME,
BookingStatus.ONBOARDING,
BookingStatus.DRIVER_NOT_FOUND,
BookingStatus.ARRIVED,
BookingStatus.PAID,
BookingStatus.CANCELLED,
*/
class Booking extends Model {
  static init(sequelize) {
    super.init(
      {
        customerId: {
          type: Sequelize.INTEGER,
          field: "ma_khach_hang"
        },
        staffId: {
          type: Sequelize.INTEGER,
          field: "ma_nhan_vien_ho_tro"
        },
        code: {
          type: Sequelize.STRING,
          field: "code"
        },
        amount: {
          type: Sequelize.INTEGER,
          field: "tong_tien"
        },
        status: {
          type: Sequelize.STRING,
          field: "trang_thai" // đã đặt xe, đang tìm xe, đã tìm đc xe, khởi hành, đến nơi, thanh toán, huỷ chuyến, không tìm thấy tài xế
        },
        driverId: {
          type: Sequelize.STRING,
          field: "ma_tai_xe"
        },
        startTime: {
          type: Sequelize.DATE,
          field: "thoi_gian_bat_dau"
        },
        endTime: {
          type: Sequelize.DATE,
          field: "thoi_gian_ket_thuc"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "dat_xe" //Define table name
      }
    );
    return this;
  }

  static associate(models) {
    this.hasOne(models.BookingDetail, {
      foreignKey: "ma_dat_xe",
      as: 'bookingDetail'
    });

    this.hasOne(models.Payment, {
      foreignKey: "ma_dat_xe",
    });

    this.belongsTo(models.Customer, {
      foreignKey: "ma_khach_hang",
      as: "customer"
    });

    this.belongsTo(models.Driver, {
      foreignKey: "ma_tai_xe",
      as: "driver"
    });

    this.belongsTo(models.Staff, {
      foreignKey: "ma_nhan_vien_ho_tro",
      as: "staff"
    });
  }
}

export default Booking;