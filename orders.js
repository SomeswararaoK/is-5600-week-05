const cuid = require('cuid')

const db = require('./db')

const Order = db.model('Order', {
  _id: { type: String, default: cuid },
  buyerEmail: { type: String, required: true },
  products: [{
    type: String,
    ref: 'Product', // ref will automatically fetch associated products for us
    index: true,
    required: true
  }],
  status: {
    type: String,
    index: true,
    default: 'CREATED',
    enum: ['CREATED', 'PENDING', 'COMPLETED']
  }
})

async function list(options = {}) {

    const { offset = 0, limit = 25, productId, status } = options;
  
    const productQuery = productId ? {
      products: productId
    } : {}
  
    const statusQuery = status ? {
      status: status
    } : {}
  
    const query = {
      ...productQuery,
      ...statusQuery
    }
  
    const orders = await Order.find(query)
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit)
  
    return orders
}

async function get (_id) {
    // using populate will automatically fetch the associated products.
    // if you don't use populate, you will only get the product ids
    const order = await Order.findById(_id)
      .populate('products')
      .exec()
    
    return order
}

async function create (fields) {
    const order = await new Order(fields).save()
    await order.populate('products')
    return order
}

async function edit (_id, change) {
    const orders = await get(_id)
  
    // todo can we use spread operators here?
    Object.keys(change).forEach(function (key) {
      orders[key] = change[key]
    })
    
    await orders.save()
  
    return orders
  }

async function destroy(_id) {
    await Order.deleteOne({ _id })
}

module.exports={
    create,
    get,
    list,
    edit,
    destroy
}