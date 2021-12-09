var seeder = require('mongoose-seed');
var mongoose = require('mongoose');

// Connect to MongoDB via Mongoose
seeder.connect('mongodb://localhost:27017/db_mapres', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function () {

  // Load Mongoose models
  seeder.loadModels('./models/Users');

  // Clear specified collections
  seeder.clearModels('Users', function () {

    // Callback to populate DB once collections have been cleared
    seeder.populateModels(data, function () {
      seeder.disconnect();
    });

  });
});

var data = [
  {
    'model': 'Users',
    'documents': [
        {
            _id: mongoose.Types.ObjectId('5e96cbe292b97300fc903345'),
            username: 'admin',
            password: 'rahasia',
          },
          {
            _id: mongoose.Types.ObjectId('5e96cbe292b97300fc903346'),
            username: 'superadmin',
            password: 'rahasia',
          },
    ]
  }
];