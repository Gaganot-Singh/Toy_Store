
require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);


const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'})



function initialize() {
  return sequelize.sync().catch((err) => {
    throw err;
  });
}


function getAllSets() {
  return Set.findAll({ include: [Theme] });
}



function getSetByNum(setNum) {
  return Set.findAll({
    include: [Theme],
    where: { set_num: setNum },
  }).then((sets) => {
    if (sets.length > 0) return sets[0];
    else throw new Error('Sets Not Found');
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` }
      }
    })
      .then((sets) => {
        resolve(sets); 
      })
      .catch((err) => {
        reject("Sets Not Found");
      });
  });
}


function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      theme_id: setData.theme_id,
      img_url: setData.img_url,
    }).then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}


function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll({})
      .then((themes) => {
        resolve(themes);
      })
      .catch((err) => {
        reject(err.message);
      })
  })
}


function editSet(setNum, setData) {
  return new Promise((resolve, reject) => {
    Set.update({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      theme_id: setData.theme_id,
      img_url: setData.img_url,
    }, {
      where: {set_num: setNum}
    }).then(() => {
      resolve();
    }).catch((err) => {
      reject(err.errors[0].message);
    });
  });
}


function deleteSet(setNum) {
  return new Promise((resolve, reject) => {
    Set.destroy({
      where: {set_num: setNum}
    }).then(() => {
      resolve();
    }).catch((err) => {
      reject(err.errors[0].message);
    });
  });
} 

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet }



