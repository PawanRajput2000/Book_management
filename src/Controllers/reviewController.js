const mongoose = require("mongoose")
const ReviewModel = require("../Models/reviewModel")
const ObjectId = mongoose.Types.ObjectId
const BookModel = require("../Models/bookModel")



const isValid = function (value) {
    if (typeof value !== "string" || value.trim().length == 0) {
        return false
    } return true
}

const IsValidRating = function (rating) {
    if (rating < 1 || rating > 5) {
        return false
    } return true
}

const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValidString = function (data) {
    if (typeof data !== 'string' || data.trim().length == 0) {
        return false
    }
    return true
}



const createReview = async function (req, res) {
    try {


        let bookIdInParams = req.params.bookId
        if (!isValidObjectId(bookIdInParams)) {
            return res.status(400).send({ status: false, message: "Please provid valid Book Id" })
        }
        let book = await BookModel.findOne({ _id: bookIdInParams, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: "Book does not exists" })
        }
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Please Enter Details" })
        }
        let { bookId, reviewedBy, rating, review } = data

        if (!bookId) {
            data.bookId = bookIdInParams
        }

        if (!reviewedBy) {
            reviewedBy = "Kaise laga mera majak"
        }
        if (!isValidString(reviewedBy)) {
            return res.status(400).send({ status: false, message: "Reviewed By must be string and cannot be empty" })
        }


        let regex1 = /^\d+$/

        if (!rating) {
            return res.status(400).send({ status: false, message: "Ratings is required" })
        }
        if (typeof (rating) !== "number") {
            return res.status(400).send({ status: false, message: "Ratings should be numbers only" })
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, message: "Ratings should be from 1 to 5" })
        }
        if (!regex1.test(rating)) {
            return res.status(400).send({ status: false, message: "Ratings should  Not Be in Decimal" })
        }

        if (review) {
            if (!isValidString(review)) {
                return res.status(400).send({ status: false, message: "Review must be string and Not be empty" })
            }
        }
        data.reviewedAt = Date.now()
        let createdata = await ReviewModel.create(data)



        let reviewsdata = await ReviewModel.find({ bookId: bookIdInParams, isDeleted: false })
        let count = reviewsdata.length
        let bookdetails = await BookModel.findOneAndUpdate({ _id: bookIdInParams }, { $set: { reviews: count }},{new:true}).lean()
        bookdetails.reviewsData = reviewsdata
        

        return res.status(201).send({ status: true, message: "Success", data: bookdetails })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}



const reviewUpdate = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!bookId) {
            return res.status(400).send({ status: false, msg: "Please Enter BookId" })
        }
        if (!reviewId) {
            return res.status(400).send({ status: false, msg: "Please Enter reviewId" })
        }

        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid bookId" })
        }
        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid reviewId" })
        }

        let checkBookId = await BookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkBookId) {
            return res.status(404).send({ status: false, msg: "BookID Not Valid" })
        }

        let checkReviewId = await ReviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })
        if (!checkReviewId) {
            return res.status(404).send({ status: false, msg: "ReviewID Not Valid" })
        }

        let body = req.body
        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, msg: "Please Enter Details" })
        }

        const arr = ["review", "rating", "reviewedBy"]
        let key = (Object.keys(body))

        if ((!key.every(ele => arr.includes(ele)) || (key.length > 3))) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid Details" })
        }

        let { review, rating, reviewedBy } = body



        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, msg: "Please Enter Valid review " })
            }
        }

        let regex = /^\d+$/


        if (rating) {
            if (!IsValidRating(rating)) {
                return res.status(400).send({ status: false, msg: "Please Enter Valid Rating " })
            }
            if (!(regex.test(rating))) {
                return res.status(400).send({ status: false, message: "Ratings cannot be in decimals" })
            }
        }


        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "Please Enter Valid  Name" })
            }
        }


        let updateReview = await ReviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId }, body, { new: true })

        let reviewsdata = await ReviewModel.find({ bookId: bookId, isDeleted: false })
        let count = reviewsdata.length
        let bookdetails = await BookModel.findOneAndUpdate({ _id: bookId }, { $set: { reviews: count } }).lean()
        bookdetails.reviewsData = reviewsdata

        return res.status(200).send({ status: true, message: "Success", data: bookdetails })

    } catch (err) {
        console.log(error)
        return res.status(500).send({ status: false, Error: err.message })
    }
}


const deleteReview = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        let isValidbookID = mongoose.isValidObjectId(bookId);
        if (!isValidbookID) {
            return res.status(400).send({ status: false, msg: "Book Id is not valid!" })
        }
        const reviewId = req.params.reviewId;
        let isValidReviewID = mongoose.isValidObjectId(reviewId);
        if (!isValidReviewID) {
            return res.status(400).send({ status: false, msg: "Review Id is not valid!" });
        }
        let bookIdCheck = await BookModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookIdCheck) {
            return res.status(404).send({ status: false, message: "Book does not exist" });
        }

        let reviewIdCheck = await ReviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!reviewIdCheck) {
            return res.status(404).send({ status: false, message: "Review does not exist" })
        }


        let update = await ReviewModel.findOneAndUpdate({ _id: reviewId },{ $set: { isDeleted: true } }, { new: true })

        let reviewsdata = await ReviewModel.find({ bookId: bookId, isDeleted: false })
        let count = reviewsdata.length
        let bookdetails = await BookModel.findOneAndUpdate({ _id: bookId }, { $set: { reviews: count }},{new:true} ).lean()
        bookdetails.reviewsData = reviewsdata
        return res.status(200).send({ status: true, data: bookdetails })


    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createReview, reviewUpdate, deleteReview }
