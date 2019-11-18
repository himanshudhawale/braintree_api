const express = require('express');
const router = express.Router();
const braintree = require('braintree');
const userService = require('./user.service');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "",
  publicKey:  "",
  privateKey: ""
});


router.get('/braintree', function(req, res) {
  res.send('Blah blah blah');
});

router.post('/token',async (req,res)=>{
    gateway.clientToken.generate({
        customerId: req.body.customerID
      }, function (err, response) {
        res.send(response);
    });

});

router.get('/create_customer', function(req,res){
  gateway.customer.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
      }, function (err, result) {
        userService.update(req.params.id, req.body)
            .then(() => res.json({}))
            .catch(err => next(err));
        console.log(result);
  });
});



router.post("/sandbox", function (req, res) {
    var nonceFromTheClient = req.body.paymentMethodNonce;
    gateway.transaction.sale({
        amount: req.body.amount,
        paymentMethodNonce: nonceFromTheClient
      }, function (err, result) {
        res.send(result);
      });

});

module.exports = router;
