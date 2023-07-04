const userHelper = require("../helpers/userHelper")
const cartHelper = require('../helpers/cartHelper')
const couponHelpers = require('../helpers/couponHelper')
const orderHelpers = require('../helpers/orderHelper')
const userModel = require('../models/userSchema')
const bannerModel = require('../models/bannerSchema')
const { sendOtpApi, otpVerify } = require('../api/twilio')


module.exports = {
    
    // Get Home Page
getHomePage: (req, res) => {
    try {
      let users = req.session?.user;
      bannerModel.Banner.find()
        .then((banner) => {
          res.render('user/home', { layout: 'Layout', banner, users });
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get Signup Page
  getSignupPage: (req, res) => {
    try {
      res.render('user/signup', { layout: 'Layout' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Post Signup Page
  doSignup: (req, res) => {
    try {
      let data = req.body;
      userHelper.doSignup(data).then((response) => {
        req.session.user = response.data;
        res.send(response);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get login Page
  getLoginPage: (req, res) => {
    try {
      res.render('user/login', { layout: 'Layout' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Post Login
  dopostLogin: (req, res) => {
    try {
      userHelper.loginPost(req.body).then((response) => {
        if (response.status) {
          req.session.user = response.users;
          let users = req.session.user;
          bannerModel.Banner.find()
            .then((banner) => {
              res.render('user/home', { layout: 'Layout', users, banner });
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          res.render('user/login', { layout: 'Layout' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  

    
    // //GEt Contact Page

    // getContactPage: (req, res) => {
    //     res.render('user/contact', { layout: 'Layout' })
    // },
    

    // //GET Back page

    getBackPage: (req, res) => {
        res.redirect('back')
    },    

    // /* GET Otp Login Page. */

    otpLogin: async (req, res) => {
        const { mobileNumber } = req.body;
        req.session.number = mobileNumber;
        try {
            const user = await userHelper.getUserNumber(mobileNumber);
            if (user.status !== true) {
                return res.status(200).json({ error: true, message: 'Wrong Mobile Number' });
            }
            const status = await sendOtpApi(mobileNumber);
            if (!status) {
                return res.status(200).json({ error: true, message: 'Something went wrong' });
            }
            res.status(200).json({ error: false, message: 'Otp has been send successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error occured' });
        }
    },

    // /* GET Otp verify Page. */

    otpVerify: async (req, res) => {

        const { otp } = req.body;
        let number = req.session.number
        console.log(otp, req.body, number, '--');
        const user = await userModel.user.findOne({ mobile: number }).lean().exec()
        req.session.user = user;
        console.log(user);
        try {
            const status = await otpVerify(otp, number)

            if (!status) {
                res.status(200).json({ error: false, message: 'Something went wrong' })
            }
            res.status(200).json({ error: false, message: 'Otp has been verified' })

        } catch (error) {
            res.status(500).json({ message: 'Internal server error occured' })
        }
    },

    // // Post Logout Page.

    logout: (req, res) => {
        userHelper.destroySession(req);
        // res.render('user/home', { layout: 'Layout' });
        res.redirect('/')
      },

    // //Get Shop Page

    getShopPage: async (req, res) => {
        try {

            let users = req.session.user ? req.session.user._id : null; 
        console.log('1');
        
            let count = await cartHelper.getCartCount(users)
            console.log('2'); 
            const page = parseInt(req.query?.page) || 1
            console.log('3');
            const perPage = 6
            if (req.query?.search || req.query?.sort || req.query?.filter) {
                console.log('4');
                const { product, currentPage, totalPages, noProductFound } = await userHelper.getQueriesOnShop(req.query)
                console.log('5');
                noProductFound ?
              
                    req.session.noProductFound = noProductFound
                 
                    : req.session.selectedProducts = product
                    //  console.log(product, users, count, currentPage, totalPages);
                res.render('user/shop', { layout: 'Layout',users, product, count,totalPages, currentPage, productResult: req.session.noProductFound })
            } else {
                let currentPage = 1
                const { product, totalPages } = await userHelper.getAllProducts(page, perPage);
                if (product?.length != 0)
                    req.session.noProductFound = false
                     //console.log(product,'prooo');
                     //console.log(product, users, count, totalPages, currentPage)
                res.render('user/shop', { layout: 'Layout',users, product, count, currentPage,totalPages, productResult: req.session.noProduct })
                req.session.noProductFound = false
            }

        } catch (error) {
            console.log(error)
        }
    },

    // //Get Product Details

    getProductDetails: (req, res) => {
        let users = req.session?.user
        let proId = req.params.id

        userHelper.getProductDetails(proId).then((product) => {
            res.render('user/productDetails', { layout: 'Layout',users, product})
        })

    },

    // /* GET EditProduct Page. */

    // getEditProduct: (req, res) => {
    //     let admin = req.session.admin
    //     let proId = req.params.id;
    //     adminHelpers.getEditProduct(proId).then(async (product) => {
    //         let category = await categoryModel.Category.find()
    //         res.render('admin/editProduct', { layout: 'adminLayout', product, category, admin })
    //     })

    // },

    getDetails: (userId) => {
        try {
            return new Promise((resolve, reject) => {
                userModel.user.findOne({ _id: userId }).then((user) => {
                    resolve(user)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    // verify coupon
    verifyCoupon: (req, res) => {
        let couponCode = req.params.id
        let userId = req.session.user._id
        couponHelpers.verifyCoupon(userId, couponCode).then((response) => {
            res.send(response)
        })
    },

    // apply coupon
    applyCoupon: async (req, res) => {
        let couponCode = req.params.id
        let userId = req.session.user._id
        let total = await orderHelpers.totalCheckOutAmount(userId)
        couponHelpers.applyCoupon(couponCode, total).then((response) => {
            res.send(response)
        })
    },
    


};