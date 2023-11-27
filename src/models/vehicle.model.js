import Sequelize, { Model } from "sequelize";

class Vehicle extends Model {
  static init(sequelize) {
    super.init(
      {
        driverId: {
          type: Sequelize.INTEGER,
          field: "ma_tai_xe"
        },
        brand: {
          type: Sequelize.STRING,
          field: "hang_xe"
        },
        model: {
          type: Sequelize.STRING,
          field: "hieu_xe"
        },
        licensePlate: {
          type: Sequelize.STRING,
          field: "bien_so_xe"
        },
        image: {
          type: Sequelize.STRING,
          field: "hinh_anh"
        },
      },
      {
        sequelize,
        timestamps: true, //If it"s false do not add the attributes (updatedAt, createdAt).
        createdAt: "thoi_gian_tao",
        updatedAt: "thoi_gian_cap_nhat",
        tableName: "xe" //Define table name
      }
    );
    return this;
  }
}

export default Vehicle;