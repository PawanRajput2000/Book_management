const BookModel = require('../Models/bookModel')
const UserModel = require('../Models/userModel')
const mongoose = require('mongoose')
const reviewmodel = require('../Models/reviewModel')
const multer = require ('multer')




const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValidString = function (data) {
    if (typeof data !== 'string' || data.trim().length == 0) {
        return false
    }
    return true

}

const isISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/

const isValidDate = RegExp(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)




const createBooks = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Please enter Books Details" })
        }
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data
        let createBook = {}

        if (!title) {
            return res.status(400).send({ status: false, message: "Please Enter Title" })
        }
        if (!isValidString(title)) {
            return res.status(400).send({ status: false, message: "Title must be string and cannot be empty" })
        }
        title = title.trim().toLowerCase()
        let titleUnique = await BookModel.findOne({ title: title })
        if (titleUnique) {
            return res.status(400).send({ status: false, message: "Title Already Exist" })
        }
        createBook.title = title

        if (!excerpt) {
            return res.status(400).send({ status: false, message: "Please Enter  excerpt" })
        }
        if (!isValidString(excerpt)) {
            return res.status(400).send({ status: false, message: "Excerpt must be string and cannot be empty" })
        }
        excerpt = excerpt.trim()
        createBook.excerpt = excerpt

        if (!userId) {
            return res.status(400).send({ status: false, message: "Please Enter userID" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Enter a Valid User Id" })
        }
        let findId = await UserModel.findOne({ userId: userId, isDeleted: false })
        if (!findId) {
            return res.status(404).send({ status: false, message: "User not found" })
        }
        createBook.userId = userId



        if (!ISBN) {
            return res.status(400).send({ status: false, message: "Please Enter ISBN" })
        }
        if (!isValidString(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN must be string and cannot be empty" })
        }
        ISBN = ISBN.trim()
        if (!isISBN.test(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN msut contain only 13 Number" })
        }
        let checkIsbn = await BookModel.findOne({ ISBN: ISBN })
        if (checkIsbn) {
            return res.status(400).send({ status: false, message: "ISBN should be Unique" })
        }

        createBook.ISBN = ISBN

        if (!category) {
            return res.status(400).send({ status: false, message: "Please Enter Category" })
        }
        if (!isValidString(category)) {
            return res.status(400).send({ status: false, message: "Category must be string and cannot be empty" })
        }
        category = category.trim().toLowerCase()
        createBook.category = category

        if (!subcategory) {
            return res.status(400).send({ status: false, message: "Please Enter SubCategory" })
        }
        if (!isValidString(subcategory)) {
            return res.status(400).send({ status: false, message: "Subcategory must be string and cannot be empty" })
        }
        subcategory = subcategory.trim().toLowerCase()
        createBook.subcategory = subcategory

        if (!releasedAt) {
            return res.status(400).send({ status: false, message: "Released Date is required" })
        }
        if (!isValidDate.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "Please enter Released Date in valid format i.e. YYYY-MM-DD" })
        }

        createBook.releasedAt = releasedAt

        ///
      

        let savedData = await BookModel.create(createBook)
        return res.status(201).send({ status: true, message: "Book created susseccfully", data: savedData })
    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}


const getBooksByQuery = async function (req, res) {
    try {
        let bodyData = req.query

        if (Object.keys(bodyData).length === 0) {
            let allBooks = await BookModel.find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

            return res.status(200).send({ status: false, message: "List of All Books", data: allBooks })
        } else {
            let { userId, category, subcategory } = bodyData
            let filter = {}
            if (userId) {
                if (!isValidObjectId(userId)) {
                    return res.status(400).send({ status: false, message: "Please provide a Valid User Id" })
                }
                filter.userId = userId
            }
            if (category) {
                if (!isValidString(category)) {
                    return res.status(400).send({ status: false, message: "Please provid category and it should be string" })
                }
                category = category.trim().toLowerCase()
                filter.category = category
            }
            if (subcategory) {
                if (!isValidString(subcategory)) {
                    return res.status(400).send({ status: false, message: "Please provid subcategory and it should be string" })
                }
                subcategory = subcategory.trim().toLowerCase()
                filter.subcategory = subcategory
            }
            filter.isDeleted = false
            if (Object.keys(filter).length > 4) {
                return res.status(400).send({ status: false, messgae: "Query can only among these: 'userId, category, subcategory" })
            }

            if (userId || category || subcategory) {
                let getDataByFilter = await BookModel.find(filter).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

                if (getDataByFilter.length === 0) {
                    return res.status(404).send({ status: false, message: "No books found by given query" })
                }
                return res.status(200).send({ status: false, message: "List of Books", data: getDataByFilter })
            }
            return res.status(400).send({ status: false, message: "Invalid entry in Query Params" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}


const getBookFromPath = async function (req, res) {

    try {
        let bookID = req.params.bookId
        if (!isValidObjectId(bookID)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid BookId" })
        }
        bookID.trim()

        let searchBook = await BookModel.findOne({ _id: bookID, isDeleted: false }).lean()

        if (!searchBook) {
            return res.status(404).send({ status: false, msg: "Book Not Found" })
        }

        let reviewsdata = await reviewmodel.find({ bookId: bookID, isDeleted: false })
        let count = reviewsdata.length
        searchBook.reviews = count

        let emptyArr = []
        if (count == 0) {
            searchBook.reviewsData = emptyArr
        }
        searchBook.reviewsData = reviewsdata

        return res.status(200).send({ status: true, data: searchBook })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }
}


const updateBooks = async function (req, res) {
    try {
        let book_Id = req.params.bookId

        if (!book_Id) {
            return res.status(400).send({ status: false, message: "Book Id is required" })
        }
        if (!isValidObjectId(book_Id)) {
            return res.status(400).send({ status: false, message: 'please provide a valid id' })
        }
        let book = await BookModel.findOne({ _id: book_Id, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: "Book does not exists" })
        }

        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: 'No data provided' })
        }
        if (Object.keys(data).length > 4) {
            return res.status(400).send({ status: false, message: 'bad request ,Please Enter only Valid inputs' })
        }



        let { title, excerpt, releasedAt, ISBN } = data


        let arr = ["title", "excerpt", "releasedAt", "ISBN"]
        if (!(Object.keys(data).every(ele => arr.includes(ele)))) {
            // console.log(Object.keys(data))
            return res.status(400).send({ status: false, message: "Please Enter Valid Details To Updates" })
        }


        if (title) {
            if (!isValidString(title)) {
                return res.status(400).send({ status: false, message: 'Please enter valid title' })
            }
            let isUniqueTitle = await BookModel.findOne({ title: title })
            if (isUniqueTitle) {
                return res.status(400).send({ status: false, message: 'Title already exist, Please provide a unique title' })
            }
        }

        if (excerpt) {
            if (!isValidString(excerpt)) {
                return res.status(400).send({ status: false, message: 'Please enter valid excerpt' })
            }
            excerpt = excerpt.trim().toLowerCase()

        }

        if (releasedAt) {
            if (!isValidDate.test(releasedAt)) {
                return res.status(400).send({ status: false, message: 'Please enter valid date' })
            }
        }




        if (ISBN) {
            if (!isValidString(ISBN)) {
                return res.status(400).send({ status: false, message: 'ISBN must be string ' })
            }
            if (!isISBN.test(ISBN)) {
                return res.status(400).send({ status: false, message: 'Please enter valid ISBN Number ,Please Check ISBN number' })
            }
            let isUniqueTitle = await BookModel.findOne({ ISBN: ISBN })
            if (isUniqueTitle) {
                return res.status(400).send({ status: false, message: 'ISBN already exist, Please provide a unique ISBN' })
            }

        }





        let updatedBook = await BookModel.findOneAndUpdate({ _id: book_Id, isDeleted: false }, data, { new: true }).lean()

        let reviewsdata = await reviewmodel.find({ bookId: book_Id, isDeleted: false })
        let count = reviewsdata.length
        updatedBook.reviews = count

        let emptyArr = []
        if (count == 0) {
            updatedBook.reviewsData = emptyArr
        }
        updatedBook.reviewsData = reviewsdata

        return res.status(200).send({ status: true, message: 'Success', data: updatedBook })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const deleteBooks = async function (req, res) {
    try {
        let book_id = req.params.bookId;
        if (!book_id) {
            return res.status(400).send({ status: false, message: 'Please Enter Book_id' })
        }

        if (!isValidObjectId(book_id)) {
            return res.status(400).send({ status: false, message: 'please provide a valid id' })
        }

        let book = await BookModel.findOne({ _id: book_id, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: 'No Book present with this id, please provide another valid id ' })
        }


        await BookModel.findOneAndUpdate({ _id: book_id }, { $set: { isDeleted: true, deletedAt: Date.now() } })


        return res.status(200).send({ status: true, message: 'Book deleted successfully' })

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}



module.exports = { createBooks, getBooksByQuery, getBookFromPath, updateBooks, deleteBooks  }