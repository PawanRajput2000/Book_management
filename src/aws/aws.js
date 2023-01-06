const aws=require("aws-sdk")


aws.config.update({
    accessKeyId : "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey : "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",
    region: "ap-south-1"
})

let uploadFile= async ( files) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  
        Key: "bookCover/" + files.originalname,  
        Body: files.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
         //console.log(data)
        // console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}
let bookCoverurl =async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            
            let uploadedFileURL= await uploadFile(files[0])
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(404).send({ msg: "no file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
}

module.exports = {bookCoverurl};