// const express = require('express')
const adminHelper = require("../helpers/adminHelper")
const orderHelpers = require("../helpers/orderHelper")
const couponHelpers = require('../helpers/couponHelper')
// const productModel = require('../models/productSchema')
const userController = require('./userController')
const categoryModel = require('../models/categorySchema')
const { user } = require("../models/userSchema")
const { order } = require("../models/orderSchema")




module.exports = {

   // Get login
  getAdminLogin: (req, res) => {
    try {
      res.render('admin/login', { layout: false });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Logout
  doLogout: (req, res) => {
    try {
      res.redirect('/admin');
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Get Dashboard
  getAdminPage: async (req, res) => {
    try {
      console.log('called');
      const admin = req.session.admin;
      let totalProducts,
        days = [];
      let ordersPerDay = {};
      let paymentCount = [];

      let Products = await adminHelper.getAllProducts();
      totalProducts = Products.length;

      const response = await orderHelpers.getOrderByDate();
      let result = response;

      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].orders.length; j++) {
          let ans = {};
          ans["createdAt"] = result[i].orders[j].createdAt;
          days.push(ans);
        }
      }

      days.forEach((order) => {
        let day = order.createdAt.toLocaleDateString("en-US", {
          weekday: "long",
        });
        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      });

      let getCodCount = await adminHelper.getCodCount();
      let codCount = getCodCount.length;

      let getOnlineCount = await adminHelper.getOnlineCount();
      let onlineCount = getOnlineCount.length;

      let getWalletCount = await adminHelper.getWalletCount();
      let WalletCount = getWalletCount.length;

      paymentCount.push(onlineCount);
      paymentCount.push(codCount);
      paymentCount.push(WalletCount);

      let orderByCategory = await orderHelpers.getOrderByCategory();

      let Men = 0,
        Women = 0,
        Kids = 0;

      orderByCategory.forEach((order) => {
        order.forEach((product) => {
          if (product.category === 'Men') Men += product.quantity;
          else if (product.category === 'Women') Women += product.quantity;
          else if (product.category === 'Kids') Kids += product.quantity;
        });
      });

      let category = [Men, Women, Kids];

      const length = await orderHelpers.getAllOrders();
      const total = await orderHelpers.getAllOrdersSum();

      res.render('admin/dashboard', {
        layout: "adminLayout",
        admin,
        length,
        total,
        totalProducts,
        ordersPerDay,
        paymentCount,
        category
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Post Login Page.
  postLogin: (req, res) => {
    try {
      let data = req.body;
      console.log(data, 'iii');
      adminHelper.doLogin(data).then((loginAction) => {
        req.session.admin = loginAction;
        res.send(loginAction);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Get User List
  getUserList: (req, res) => {
    try {
      let admin = req.session.admin;
      adminHelper.getUserList().then((user) => {
        console.log(user, 'user..//');
        res.render('admin/userList', { layout: 'adminLayout', user, admin });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Change User Status
  changeUserStatus: (req, res) => {
    try {
      let userId = req.query.id
      let status = req.query.status
      console.log(userId, status, '))__');
      if (status === 'false') {
        req.session.user = null
      }
      adminHelper.changeUserStatus(userId, status).then((response) => {
        console.log(response, 'response--=');
        res.send(response)
      })
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

   // Get Product List
   getProductList: (req, res) => {
    try {
      adminHelper.getProductList().then((product) => {
        console.log(product);
        res.render('admin/productList', { layout: 'adminLayout', product });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // GET Add Product
  getAddProduct: (req, res) => {
    try {
      res.render('admin/addProduct', { layout: 'adminLayout' });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // POST Add Product
  postAddProduct: (req, res) => {
    try {
      console.log(req.body, '{{]]');
      let file = req.files;
      const fileName = file.map((file) => {
        return file.filename;
      });
      console.log(file);
      const product = req.body;
      product.img = fileName;
      adminHelper.postAddProduct(product).then(() => {
        res.redirect('/admin/dashboard');
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // GET EditProduct Page
  getEditProduct: (req, res) => {
    try {
      let admin = req.session.admin;
      let proId = req.params.id;
      adminHelper.getEditProduct(proId).then(async (product) => {
        // let category = await categoryModel.Category.find()
        res.render('admin/editProduct', { layout: 'adminLayout', product, admin });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Post Edit Product
  postEditProduct: async (req, res) => {
    try {
      let proId = req.params.id;
      let file = req.files;
      let image = [];

      let previousImages = await adminHelper.getPreviousImages(proId);

      console.log(previousImages, 'oldimage');
      console.log(file, 'uploaded');

      if (req.files.image1) {
        image.push(req.files.image1[0].filename);
      } else {
        image.push(previousImages[0]);
      }

      if (req.files.image2) {
        image.push(req.files.image2[0].filename);
      } else {
        image.push(previousImages[1]);
      }
      if (req.files.image3) {
        image.push(req.files.image3[0].filename);
      } else {
        image.push(previousImages[2]);
      }
      if (req.files.image4) {
        image.push(req.files.image4[0].filename);
      } else {
        image.push(previousImages[3]);
      }

      adminHelper.postEditProduct(proId, req.body, image).then(() => {
        res.redirect('/admin/productList');
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Delete Product
  // deleteProduct: (req, res) => {
  //     let proId = req.params.id
  //     adminHelper.deleteProduct(proId).then((response) => {
  //         console.log(response, '==++==');
  //         res.send(response)
  //     })
  // },

  unlistProduct: async (req, res) => {
    try {
      let condition = req.body.condition;
      let proId = req.body.proId;
      await adminHelper.unlistProduct(proId, condition).then((product) => {
        res.json(true);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // GET ADD CATEGORY
  getAddcategory: async (req, res) => {
    try {
      let admin = req.session.admin;
      let categories = await categoryModel.Category.find();
      res.render('admin/addCategory', { layout: "adminLayout", categories, admin });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // POST ADD CATEGORY
  postAddcategory: (req, res) => {
    try {
      adminHelper.addCategory(req.body).then((response) => {
        res.redirect('/admin/addCategory');
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // GET EDIT CATEGORY
  getEditcategory: async (req, res) => {
    try {
      let categoryId = req.params.id;

      const response = await adminHelper.getEditcategory(categoryId);
      console.log(response);
      res.send(response);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // POST EDIT CATEGORY
  postEditcategory: async (req, res) => {
    try {
      console.log(req.body);

      const data = req.body; // Assuming the necessary data is present in the request body

      const response = await adminHelper.postEditcategory(data);
      res.send(response);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // DELETE CATEGORY
  deleteCategory: (req, res) => {
    try {
      let catId = req.params.id;
      adminHelper.deleteCategory(catId).then((response) => {
        // console.log(catId,"ccccccccccc");
        res.send(response);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

    /* GET Order List Page. */
    
    getOrderList: (req, res) => {
        let userId = req.params.id
        let admin = req.session.admin
        // orderHelpers.getAddress(userId).then((address) => {
        adminHelper.getUserList(userId).then((user) => {
            console.log(user, 'user');
            orderHelpers.getOrders(userId).then((response) => {
                let order = response?.orders
                function sortByCreatedAt(a, b) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                order?.sort(sortByCreatedAt)
                console.log(order,'o----');
                res.render('admin/ordersList', { layout: 'adminLayout', user, userId, admin, order })
            })
        })
        // })
    },

    /* GET Order Details Page. */

    getOrderDetails: async (req, res) => {
        let admin = req.session.admin
        let orderId = req.query.orderId
        let userId = req.query.userId
        let userDetails = await userController.getDetails(userId)
        orderHelpers.getOrderAddress(userId, orderId).then((address) => {
            orderHelpers.getSubOrders(orderId, userId).then((orderDetails) => {
                orderHelpers.getOrderedProducts(orderId, userId).then((product) => {
                    orderHelpers.getTotal(orderId, userId).then((productTotalPrice) => {
                        orderHelpers.getOrderTotal(orderId, userId).then((orderTotalPrice) => {
                            // console.log('admin',admin,'admin');
                            // console.log('orderDetails',orderDetails,'orderDetails');
                            // console.log('address',address,'address');
                            // console.log('product',product,'product');
                            // console.log('productTotalPrice',productTotalPrice,'productTotalPrice');
                            // console.log('orderTotalPrice',orderTotalPrice,'orderTotalPrice');
                            // console.log('userDetails',userDetails,'userDetails');
                            // console.log('orderId',orderId,'orderId');
                            res.render('admin/orderDetails', {
                                layout: 'adminLayout', admin, userDetails,
                                address, product, orderId, orderDetails, productTotalPrice, orderTotalPrice
                            })
                        })
                    })
                })
            })
        })
    },

     // GET Add Banner

    getAddBanner:(req,res)=>{
        let admin = req.session.admin
        res.render('admin/addBanner',{layout : 'adminLayout',admin})
    },

     // Post Add Banner

    postAddBanner: (req, res) => {
        adminHelper.addBanner(req.body, req.file.filename).then((response) => {
          if (response) {
            console.log(response,'000');
            res.redirect("/admin/add-banner");
          } else {
            res.status(505);
          }
        });
      },

      // Get BannerList

      getBannerList:(req,res)=>{
        let admin = req.session.admin
        adminHelper.getBannerList().then((banner)=>{
            console.log(banner,'banner');

            res.render('admin/bannerList',{layout : 'adminLayout',admin,banner})
        })
      },

     // Get Edit Banner

      getEditBanner:(req,res)=>{
        let admin = req.session.admin
        adminHelper.getEditBanner(req.query.banner).then((banner)=>{
            res.render("admin/editBanner", {layout : "adminLayout", admin, banner})
        })
      },

     // Post Edit Banner 

      postEditBanner:(req,res)=>{
        console.log(req.query.editbanner,'req.query.editbanner');
        console.log( req.body,'req.body');
        console.log( req?.file?.filename,' req?.file?.filename');
        adminHelper.postEditBanner(req.query.editbanner, req.body, req?.file?.filename).then((response)=>{
            res.redirect("/admin/banner-list")
        })
      },

     // Delete Banner
     
      deleteBanner:(req,res)=>{
        adminHelper.deleteBanner(req.params.id).then((response)=>{
            res.send(response)
        })
      },

      // Get All User Orders

      getalluserOrders: (req, res) => {
        let admin = req.session.admin
        adminHelper.getUserList().then((user) => {
            console.log(user,'user..//');
            res.render('admin/orders', { layout: 'adminLayout', user, admin })
        
        })
    },

    /* GET Sales Report Page. */
    getSalesReport: async (req, res) => {
      let admin = req.session.admin
      let report = await adminHelper.getSalesReport()
      let details = []
      const getDate = (date) => {
          let orderDate = new Date(date)
          let day = orderDate.getDate()
          let month = orderDate.getMonth() + 1
          let year = orderDate.getFullYear()
          return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
      }

      report.forEach((orders) => {
          details.push(orders.orders)
      })

      res.render("admin/salesReport", { layout: 'adminLayout', admin, details, getDate })
  },


  postSalesReport: async (req, res) => {
      try {
        let admin = req.session.admin;
        let details = [];
        const getDate = (date) => {
          let orderDate = new Date(date);
          let day = orderDate.getDate();
          let month = orderDate.getMonth() + 1;
          let year = orderDate.getFullYear();
          return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`;
        };
    
        const orderData = await adminHelper.postReport(req.body);
        orderData.forEach((orders) => {
          details.push(orders.orders);
        });
    
        res.render("admin/salesReport", { layout: 'adminLayout', admin, details, getDate });
      } catch (error) {
        res.status(500).send(error.message);
      }
    },
    
    /* GET Add Coupon Page. */
    getAddCoupon: (req, res) => {
      let admin = req.session.admin
      res.render('admin/addCoupon', { layout: 'adminLayout', admin })
  },

  /* GET Generate Coupon Code Page. */
  generatorCouponCode: (req, res) => {
      couponHelpers.generatorCouponCode().then((couponCode) => {
          console.log(couponCode, '-----');
          res.send(couponCode)
      })
  },

  /* Post Add Coupone Page. */
  postaddCoupon: (req, res) => {
      let data = {
          couponCode: req.body.coupon,
          validity: req.body.validity,
          minPurchase: req.body.minPurchase,
          minDiscountPercentage: req.body.minDiscountPercentage,
          maxDiscountValue: req.body.maxDiscount,
          description: req.body.description
      }
      couponHelpers.postaddCoupon(data).then((response) => {
          res.send(response)
      })
  },

  /* GET Coupon List Page. */
  getCouponList: (req, res) => {
      let admin = req.session.admin
      couponHelpers.getCouponList().then((couponList) => {
          res.render('admin/couponList', { layout: 'adminLayout', admin, couponList })
      })
  },


  /* DELETE Coupon  Page. */
  removeCoupon: (req, res) => {
      let couponId = req.body.couponId
      couponHelpers.removeCoupon(couponId).then((successResponse) => {
          res.send(successResponse)
      })
  },


}



