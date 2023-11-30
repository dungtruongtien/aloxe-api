import Sequelize, { Model } from "sequelize";

class Driver extends Model {
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
        licenseType: {
          type: Sequelize.STRING,
          field: "loai_bang_lai"
        },
        licenseExpiry: {
          type: Sequelize.STRING,
          field: "ngay_het_han_bang"
        },
        status: {
          type: Sequelize.STRING,
          field: "trang_thai"
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
        tableName: "tai_xe" //Define table name
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "ma_nguoi_dung",
      as: 'user'
    });
    
    this.hasOne(models.Vehicle, {
      foreignKey: "ma_tai_xe",
      as: 'vehicle'
    });

    this.hasOne(models.DriverLoginSession, {
      foreignKey: "ma_tai_xe",
      as: 'driverLoginSession'
    });
  }
}

export default Driver;