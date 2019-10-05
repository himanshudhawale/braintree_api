const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const braintree = require('braintree');
var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  // Use your own credentials from the sandbox Control Panel here
  merchantId: "np2ddp8875qm3bst",
  publicKey:  "m329x6x47chz7rnd",
  privateKey: "3bdf29a13535f5715e2491a0620f4b30"
});


module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete

};

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}




async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ email: userParam.email})) {
        throw 'Email "' + userParam.email  + '" is already taken';
    }

         // user.customerID=result.id;
         const user =  new User(userParam);


         gateway.customer.create({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: "8080808080"
          }).then(function (result) {
            if (result.success) {
              console.log('Customer ID: ' + result.customer.id);

              user.customerID = result.customer.id;
              if (userParam.password) {
                    user.hash = bcrypt.hashSync(userParam.password, 10);
                  }

              user.save(function(err, res){
                        if (err){throw err;}
                         console.log('user is: ', res)
                       });

            } else {
              console.error(result.message);
            }
          }).catch(function (err) {
            console.error(err);
          });

         // gateway.customer.create({
         //        firstName: user.firstName,
         //        lastName: user.lastName,
         //        email: user.email,
         //        phone: "8080808080"
         //      }).then(function (result) {
         //        if (result.success) {
         //          console.log('Customer ID: ' + result.id);
         //          userParam.customerID=result.id;
         //
         //          const user1=  new User(userParam);
         //          user=user1;
         //
         //        } else {
         //          console.error(result.message);
         //        }
         //      }).catch(function (err) {
         //        console.error(err);
         //      }).then(user.save())

          //
          //   await user.save();
          // // hash password
          //


          // firstName: userParam.firstName,
          // lastName: userParam.lastName,
          // email: userParam.email,
          //




}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== userParam.email && await User.findOne({ email: userParam.email })) {
        throw 'Email"' + userParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();



}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}
