const express = require('express')
const cartHelper = require('../helpers/cartHelper')
const orderHelper = require('../helpers/orderHelper')


module.exports = {

   // GET Cart
getCart: async (req, res) => {
    try {
      let users = req.session?.user;
      let user = req.session?.user?._id;
  
      let count = await cartHelper.getCartCount(user);
      let total = await orderHelper.totalCheckOutAmount(user);
      let subTotal = await orderHelper.getSubTotal(user);
  
      cartHelper.getCartItems(user).then((cartItems) => {
        res.render('user/shopCart', { layout: 'Layout', users, user, cartItems, subTotal, total, count });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  
  /* POST ADD To Cart Page */
  addToCart: (req, res) => {
    try {
      cartHelper.addToCart(req.params.id, req.session.user._id)
        .then((response) => {
          console.log(response, 'res');
          res.send(response);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('An error occurred');
        });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  
  /* POST Update cart quantity Page */
  updateQuantity: (req, res) => {
    try {
      let userId = req.session.user._id;
      cartHelper.updateQuantity(req.body).then(async (response) => {
        response.total = await orderHelper.totalCheckOutAmount(userId);
        response.subTotal = await orderHelper.getSubTotal(userId);
        res.json(response);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  
  /* Delete product from cart */
  deleteProduct: (req, res) => {
    try {
      console.log('came here');
      console.log(req.body, 'lol');
      cartHelper.deleteProduct(req.body).then((response) => {
        res.send(response);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  }
  

  
}