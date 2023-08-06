const express = require('express')
const router = express.Router()
const Record = require('../../models/record')
const Category = require('../../models/category')
const User = require('../../models/user')

router.get('/new', (req, res) => {
  Category.find()
    .lean()
    .then(categories => {
      res.render("new", { categories })
    })
})

router.post('/new', (req, res) => {
  const userId = req.user._id
  const { name, date, categoryName, amount } = req.body
  Category.findOne({ name: categoryName })
    .lean()
    .then(category => {
      let categoryId = category._id
      Record.create({
        name,
        date,
        amount,
        userId,
        categoryId
      })
    })
    .then(() => res.redirect("/"))
    .catch(error => console.log(error))
})

router.get('/:id/edit', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  Category.find()
    .lean()
    .then(categories => {
      Record.findOne({ _id, userId })
        .populate("categoryId")
        .lean()
        .then(record => {
          categories.map((category, index) => {
            if (String(category._id) === String(record.categoryId)) {
              category.selected = true
            } else {
              category.selected = false
            }
          })
          res.render("edit", { categories, record })
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

router.get('/:id/edit', async (req, res) => {
  try {
    const userId = req.user._id
    const _id = req.params.id

    const categories = await Category.find().lean()

    const record = await Record.findOne({ _id, userId })
      .populate("categoryId")
      .lean()

    if (!record) {
      return res.status(404).send('Record not found')
    }

    categories.forEach(category => {
      category.selected = String(category._id) === String(record.categoryId)
    })

    res.render("edit", { categories, record })
  } catch (error) {
    console.log(error)
    res.status(500).send('Server Error')
  }
})

router.put('/:id/edit', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  const { name, date, categoryName, amount } = req.body
  Category.findOne({ name: categoryName })
    .then(category => {
      Record.findOne({ _id, userId })
        .then(record => {
          record.name = name
          record.date = date
          record.amount = amount
          record.categoryId = category._id
          return record.save()
        })
        .then(() => res.redirect("/"))
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})


router.delete('/:id', (req, res) => {
  const userId = req.user_id
  const _id = req.params.id
  Record.findByIdAndDelete({ _id, userId })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

module.exports = router