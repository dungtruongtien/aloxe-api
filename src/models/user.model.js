import Sequelize, { Model } from "sequelize";

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING,
          field: "ten"
        },
        fullName: {
          type: Sequelize.STRING,
          field: "ten_day_du"
        },
        phoneNumber: {
          type: Sequelize.STRING,
          field: "so_dien_thoai"
        },
        email: {
          type: Sequelize.STRING,
          field: "email"
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
        tableName: "nguoi_dung" //Define table name
      }
    );
    return this;
  }

  static associate(models) {
    this.hasOne(models.Auth, {
      foreignKey: "ma_nguoi_dung",
      as: 'account'
    });

    this.hasOne(models.Customer, {
      foreignKey: "ma_nguoi_dung",
    });

    this.hasOne(models.Driver, {
      foreignKey: "ma_nguoi_dung",
    });
  }
}

export default User;