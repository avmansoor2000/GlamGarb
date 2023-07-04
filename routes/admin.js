var express = require('express');
var router = express.Router();
const multer = require('../config/multer')
const adminController = require('../controller/adminController');
const orderController = require('../controller/orderController')
const auth = require('../middleware/auth')


// Get Login Page
router.get('/', adminController.getAdminLogin)

// Get Dashboard
router.get('/dashboard',auth.adminAuth, adminController.getAdminPage)

/* Post Login Page. */
router.post('/login', adminController.postLogin)

/* Post Login Page. */
router.get('/logout',adminController.doLogout)

/* GET User List Page. */
router.get('/userList',auth.adminAuth, adminController.getUserList)

// CHANGE USER STATUS
router.put('/change_user_status', adminController.changeUserStatus)

// Get ProductList
router.get('/productList',auth.adminAuth, adminController.getProductList)

//GET Add Product
router.get('/add-product',auth.adminAuth, adminController.getAddProduct)

//POST Add Product
router.post('/add-product', multer.uploads, adminController.postAddProduct)

/* GET EditProduct Page. */
router.get('/editProduct/:id', adminController.getEditProduct)

/* Post EditProduct Page. */
router.post('/editProduct/:id', multer.editeduploads, adminController.postEditProduct)

// DELETE PRODUCT
// router.delete('/deleteProduct/:id', adminController.deleteProduct)
router.put('/unlistProduct',adminController.unlistProduct)

// GET ADD CATEGORY
router.get('/addCategory', auth.adminAuth, adminController.getAddcategory)

// POST ADD CATEGORY
router.post('/addCategory', adminController.postAddcategory)

// GET EDIT CATEGORY
router.get('/edit-category/:id', auth.adminAuth, adminController.getEditcategory)

// patch edit category
router.patch('/edit-category/:id', adminController.postEditcategory)

// DELETE CATAGORY
router.delete('/api/delete-category/:id', adminController.deleteCategory);

/* GET Order List Page. */
router.route('/order-list/:id').get(auth.adminAuth, adminController.getOrderList)

/* GET Order Details Page. */
router.route('/order-details').get(auth.adminAuth, adminController.getOrderDetails)

/* POST Order Status Page. */
router.route('/change-order-status').post(orderController.changeOrderStatus)

//GET ADD Banner
router.route('/add-banner').get(auth.adminAuth,adminController.getAddBanner).post(multer.addBannerupload,adminController.postAddBanner)

//Banner List
router.route('/banner-list').get(auth.adminAuth, adminController.getBannerList)

// Edit Banner
 router.route('/edit-banner').get(auth.adminAuth, adminController.getEditBanner)

// Post Edit Banner
 router.route('/edit-banner').post(multer.editBannerupload,adminController.postEditBanner)

// Delete Banner
router.route('/delete-banner/:id').delete(auth.adminAuth,adminController.deleteBanner)

// Get AllOrders

router.get('/orders',auth.adminAuth,adminController.getalluserOrders)

// get post sales report
router.route('/sales-report').get( auth.adminAuth,adminController.getSalesReport).post(adminController.postSalesReport)

/* GET Add Coupon Page. */
router.route('/add-coupon').get(auth.adminAuth,adminController.getAddCoupon).post(adminController.postaddCoupon)

/* GET Generate Coupon Code Page. */
router.route('/generate-coupon-code').get(auth.adminAuth,adminController.generatorCouponCode)

/* GET Coupon List Page. */
router.route('/coupon-list').get(auth.adminAuth,adminController.getCouponList)

/* DELETE Coupon  Page. */
router.route('/remove-coupon').delete(adminController.removeCoupon)



module.exports = router;
