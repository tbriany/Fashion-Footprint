const express = require('express');
const router = express.Router();
const productQueries = require('../queries/products');
const { handleErrors, checkValidId } = require('./helpers/helpers');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/products')
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname
        cb(null, filename)
    }

})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.slice(0, 6) === 'image/') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage, fileFilter
})

/* GET all product by Brand Id */
router.get('/:brand_id/all', async (req, res, next) => {

    let brand_id = req.params.brand_id

    try {
        let productByBrand = await productQueries.getProductsByBrand(brand_id)
        res.status(200).json({
            message: `Success retrieved all products for brand with id #${brand_id}`,
            payload: productByBrand
        })

    } catch (err) {
        handleErrors(res, err)
    }
})

/* GET all product by type Id */
// router.get('/fitler/:brand_id/:material_id/:type_id', async (req, res) => {
//     let {brand_id, material_id, type_id} = req.params

//     try {
//         let productByType = await productQueries.getProductByFilter(Number(brand_id), Number(material_id), Number(type_id))
//         res.status(200).json({
//             message: `Success, retrieved all products with filter id #${'brand_id ' + brand_id} ${'material_id ' + material_id} ${'type_id ' + type_id}`,
//             payload: productByType
//         })

//     } catch (err) {
//         handleErrors(res, err)
//     }
// })

/* GET all product by type Id */
router.get('/type/:type_id', async (req, res) => {
    let type_id = req.params.type_id

    try {
        let productByType = await productQueries.getProductByType(type_id)
        res.status(200).json({
            message: `Success, retrieved all products by type with id #${type_id}`,
            payload: productByType
        })

    } catch (err) {
        handleErrors(res, err)
    }
})

/* GET all product by textile Id */
router.get('/material/:textile_id', async (req, res) => {
    let material_id = req.params.textile_id

    try {
        let productByMaterial = await productQueries.getProductByMaterial(material_id)
        res.status(200).json({
            message: `Success, retrieved all products by material with id #${material_id}`,
            payload: productByMaterial
        })

    } catch (error) {
        handleErrors(res, error)
    }
})

/* GET all product by filters */
router.get('/filters/:brandId/:typeId/:textileId', async (req, res) => {
    const brandId = req.params.brandId;
    const typeId = req.params.typeId;
    const textileId = req.params.textileId;

    if (checkValidId(res, brandId) && checkValidId(res, typeId) && checkValidId(res, textileId)) {
        try {
            const products = await productQueries.getFilteredProducts(brandId, typeId, textileId);
            res.status(200).json({
                error: false,
                message: `Success, retrieved all products with filters`,
                payload: products
            })
    
        } catch (error) {
            handleErrors(res, error)
        }
    }
})


/* POST new product*/
router.post('/add/:brand_id', upload.single('productPic'), async (req, res) => {

    let brand_id = req.params.brand_id
    let type_id = req.body.type_id
    let name = req.body.name
    let description = req.body.description
    let closing_date = req.body.closing_date
    let default_pic = null
    let material_id = req.body.material_id

    if (req.file) {
        // default_pic = 'http://' + req.headers.host + '/images/products/' + req.file.filename
        default_pic = '/images/products/' + req.file.filename
    }

    if (type_id, name, default_pic, description, closing_date, brand_id) {
        try {
            let newProduct = await productQueries.createProduct(brand_id, type_id, name, default_pic, description, closing_date, material_id)
            res.status(200).json({
                message: "Success added new product",
                payload: newProduct
            })

        } catch (err) {
            handleErrors(res, err)
        }

    } else {
        res.status(403).json({
            message: "Missing information"
        })
    }
})


/* PUT single product (updates everything) */
router.put('/:product_id', upload.single('productPic'), async (req, res) => {
    let product_id = req.params.product_id
    let type_id = req.body.type_id
    let name = req.body.name
    let description = req.body.description
    let closing_date = req.body.closing_date
    let default_pic = req.body.default_pic
    let material_id = req.body.material_id

    if (req.file) {
        // default_pic = 'http://' + req.headers.host + '/images/products/' + req.file.filename
        default_pic = '/images/products/' + req.file.filename
    }

    try {
        let updatedProduct = await productQueries.updateProductInfoById(product_id, type_id, name, default_pic, description, closing_date, material_id)
        res.status(200).json({
            message: `Success updated product with id ${product_id}`,
            payload: updatedProduct
        })

    } catch (err) {
        handleErrors(res, err)
    }
})

router.patch('/:productId', async (req, res) => {
    const productId = req.params.productId
    if (checkValidId(res, productId)) {
        try {
            let updatedProduct = await productQueries.updateProductStatus(productId)
            res.status(200).json({
                message: `Success updated product with id ${productId}`,
                payload: updatedProduct
            })
    
        } catch (err) {
            handleErrors(res, err)
        }
    }
})

router.delete('/:productId', async (req, res) => {
    const productId = req.params.productId
    if (checkValidId(res, productId)) {
        try {
            let deletedProduct = await productQueries.deleteProduct(productId)
            res.status(200).json({
                message: `Success deleted product with id ${productId}`,
                payload: deletedProduct
            })
    
        } catch (err) {
            handleErrors(res, err)
        }
    }
})

module.exports = router;
